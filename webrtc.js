import Peer from "simple-peer/simplepeer.min.js";
import io from "socket.io-client";

// URLs and credentials for WebRTC and ICE servers
// Use VITE_WEBRTC_URL if configured, otherwise fallback to VITE_SOCKET_URL (same server for chat and WebRTC signaling)
const serverWebRTCUrl = import.meta.env.VITE_WEBRTC_URL || import.meta.env.VITE_SOCKET_URL;
const voiceServerBaseUrl =
  (import.meta.env.VITE_VOICE_SERVER_URL && import.meta.env.VITE_VOICE_SERVER_URL.replace(/\/$/, "")) ||
  "http://localhost:4000";

let socket = null;
let externalSocket = null; // Socket externo (del chat) que podemos reutilizar
let peers = {};
let localMediaStream = null;
let remoteStreams = {};
let isInitialized = false;

const remoteStreamSubscribers = new Set();
const localStreamSubscribers = new Set();

function notifyRemoteStreams() {
  const snapshot = { ...remoteStreams };
  remoteStreamSubscribers.forEach((callback) => {
    try {
      callback(snapshot);
    } catch (error) {
      console.error("Remote stream subscriber failed:", error);
    }
  });
}

function notifyLocalStream() {
  localStreamSubscribers.forEach((callback) => {
    try {
      callback(localMediaStream);
    } catch (error) {
      console.error("Local stream subscriber failed:", error);
    }
  });
}

export function onRemoteStreamsChange(callback) {
  remoteStreamSubscribers.add(callback);
  callback({ ...remoteStreams });
  return () => remoteStreamSubscribers.delete(callback);
}

export function onLocalStreamChange(callback) {
  localStreamSubscribers.add(callback);
  callback(localMediaStream);
  return () => localStreamSubscribers.delete(callback);
}

// Getter para React
export function getRemoteStreams() {
  return { ...remoteStreams };
}



/**
 * Gets the current socket ID
 * @returns {string|null} The socket ID or null if not connected
 */
export function getSocketId() {
  return socket?.id || null;
}

async function checkVoiceServerHealth() {
  try {
    const response = await fetch(`${voiceServerBaseUrl}/health`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Voice server health check failed with status ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(`Unable to reach voice server: ${error.message}`);
  }
}

async function loadIceConfig() {
  try {
    await checkVoiceServerHealth();

    const response = await fetch(`${voiceServerBaseUrl}/api/ice-config`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`ICE config request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data?.iceServers || !Array.isArray(data.iceServers) || data.iceServers.length === 0) {
      throw new Error("ICE config response does not include iceServers");
    }

    return data;
  } catch (err) {
    console.error("Failed to load ICE config:", err);
    return {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
  }
}

/**
 * Initializes the WebRTC connection if supported.
 * @async
 * @function init
 */
export const initWebRTC = async () => {
  if (!Peer.WEBRTC_SUPPORT) {
    console.warn("WebRTC is not supported in this browser.");
    return;
  }

  if (isInitialized) {
    return;
  }

  try {
    localMediaStream = await getMedia();
    notifyLocalStream();
    initSocketConnection();
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize WebRTC connection:", error);
    throw error;
  }
};

export function destroyWebRTC() {
  Object.values(peers).forEach((peer) => {
    if (peer?.peerConnection?.destroy) {
      peer.peerConnection.destroy();
    }
  });
  peers = {};

  if (socket) {
    socket.off("introduction");
    socket.off("newUserConnected");
    socket.off("userDisconnected");
    socket.off("signal");
    socket.disconnect();
    socket = null;
  }

  if (localMediaStream) {
    localMediaStream.getTracks().forEach((track) => track.stop());
    localMediaStream = null;
    notifyLocalStream();
  }

  remoteStreams = {};
  notifyRemoteStreams();
  isInitialized = false;
}

/**
 * Gets the user's media stream.
 * Para este proyecto solo necesitamos AUDIO, por lo que
 * pedimos únicamente audio y evitamos depender de la cámara.
 * @async
 * @function getMedia
 * @returns {Promise<MediaStream>} The user's media stream.
 */
async function getMedia() {
  try {
    // Solo audio: evita errores cuando la cámara no está disponible
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    console.error("Failed to get user media:", err);
    throw err;
  }
}

/**
 * Initializes the socket connection and sets up event listeners.
 * @function initSocketConnection
 */
/**
 * Sets an external socket to use for WebRTC signaling (e.g., reuse chat socket)
 * @param {Socket} externalSocketInstance - External socket.io instance
 */
export function setExternalSocket(externalSocketInstance) {
  if (externalSocketInstance) {
    console.log(`[WebRTC Debug] Using external socket: ${externalSocketInstance.id}`);
    externalSocket = externalSocketInstance;
    
    // Si ya tenemos un socket propio, desconectarlo y usar el externo
    if (socket && socket !== externalSocket && socket.connected) {
      console.log(`[WebRTC Debug] Disconnecting own socket, switching to external`);
      socket.off("introduction");
      socket.off("newUserConnected");
      socket.off("userDisconnected");
      socket.off("signal");
      socket.off("webrtc-signal");
      socket.off("receiveMessage");
      socket.disconnect();
    }
    
    // Usar el socket externo
    socket = externalSocket;
    
    // Configurar listeners solo si aún no están configurados
    // Verificar si ya tiene listeners de WebRTC
    const hasListeners = externalSocket._callbacks && (
      externalSocket._callbacks['signal'] || 
      externalSocket._callbacks['webrtc-signal']
    );
    
    if (!hasListeners) {
      console.log(`[WebRTC Debug] Setting up WebRTC listeners on external socket`);
      setupSocketListeners(externalSocket);
    } else {
      console.log(`[WebRTC Debug] External socket already has WebRTC listeners`);
    }
  }
}

function initSocketConnection() {
  // Si ya tenemos un socket externo, usarlo
  if (externalSocket && externalSocket.connected) {
    console.log(`[WebRTC Debug] Using external socket for signaling`);
    socket = externalSocket;
    setupSocketListeners(socket);
    return;
  }

  if (socket || !serverWebRTCUrl) {
    if (!serverWebRTCUrl) {
      console.warn("[WebRTC Debug] VITE_WEBRTC_URL is not configured.");
    }
    return;
  }

  console.log(`[WebRTC Debug] Connecting to signaling server: ${serverWebRTCUrl}`);
  socket = io(serverWebRTCUrl);
  setupSocketListeners(socket);
}

function setupSocketListeners(socketInstance) {
  if (!socketInstance) return;

  socketInstance.on("connect", () => {
    console.log(`[WebRTC Debug] Signaling socket connected: ${socketInstance.id}`);
    // Emitir evento para registrarse en el servidor de señalización
    // El servidor debería responder con 'introduction' o 'newUserConnected'
    
    console.log(`[WebRTC Debug] Emitted 'register' event`);
  });

  socketInstance.on("connect_error", (error) => {
    console.error("[WebRTC Debug] Signaling socket connection error:", error);
  });

  socketInstance.on("introduction", (otherClientIds) => {
    console.log(`[WebRTC Debug] Received introduction event with ${otherClientIds?.length || 0} clients:`, otherClientIds);
    handleIntroduction(otherClientIds);
  });
  
  socketInstance.on("newUserConnected", (theirId) => {
    console.log(`[WebRTC Debug] New user connected: ${theirId}`);
    handleNewUserConnected(theirId);
  });
  
  socketInstance.on("userDisconnected", (_id) => {
    console.log(`[WebRTC Debug] User disconnected: ${_id}`);
    handleUserDisconnected(_id);
  });
  
  // Escuchar señales en diferentes formatos
  socketInstance.on("signal", (...args) => {
    console.log(`[WebRTC Debug] Received 'signal' event with ${args.length} arguments:`, args);
    // El servidor podría enviar (to, from, data) o un objeto
    if (args.length === 3) {
      const [to, from, data] = args;
      handleSignal(to, from, data);
    } else if (args.length === 1 && typeof args[0] === 'object') {
      const { to, from, data } = args[0];
      handleSignal(to, from, data);
    } else {
      console.warn(`[WebRTC Debug] Unexpected signal format:`, args);
    }
  });

  // También escuchar señales WebRTC a través del sistema de mensajes del chat
  // como fallback si el servidor no tiene handler para 'signal'
 

  

  // Escuchar todos los eventos para debugging
  socket.onAny((eventName, ...args) => {
    if (eventName !== 'connect' && eventName !== 'disconnect' && !eventName.startsWith('connect')) {
      console.log(`[WebRTC Debug] Received event '${eventName}':`, args);
    }
  });
}

/**
 * Handles the introduction event.
 * @param {Array<string>} otherClientIds - Array of other client IDs.
 */
function handleIntroduction(otherClientIds) {
  console.log(`[WebRTC Debug] Handling introduction, creating peer connections...`);

  if (!otherClientIds || !Array.isArray(otherClientIds)) {
    console.warn("[WebRTC Debug] Invalid introduction data:", otherClientIds);
    return;
  }

  otherClientIds.forEach(async (theirId) => {
    if (theirId !== socket.id && !(theirId in peers)) {
      console.log(`[WebRTC Debug] Creating peer connection to ${theirId} (initiator: true)`);

      try {
        const pc = await createPeerConnection(theirId, true);
        peers[theirId] = { peerConnection: pc };
      } catch (error) {
        console.error(`[WebRTC Debug] Error creating peer connection to ${theirId}:`, error);
      }
    }
  });
}


/**
 * Handles the new user connected event.
 * @param {string} theirId - The ID of the newly connected user.
 */
async function handleNewUserConnected(theirId) {
  console.log(`[WebRTC Debug] Handling new user connected: ${theirId}`);

  if (theirId !== socket.id && !(theirId in peers)) {
    console.log(`[WebRTC Debug] Creating peer connection to ${theirId} (initiator: false)`);

    try {
      const pc = await createPeerConnection(theirId, false);
      peers[theirId] = { peerConnection: pc };
    } catch (error) {
      console.error(`[WebRTC Debug] Error creating peer connection for new user:`, error);
    }
  }
}


/**
 * Handles the user disconnected event.
 * @param {string} _id - The ID of the disconnected user.
 */
function handleUserDisconnected(_id) {
  if (_id !== socket.id) {
    removeRemoteStream(_id);
    delete peers[_id];
  }
}

/**
 * Handles the signal event.
 * @param {string} to - The ID of the receiving user.
 * @param {string} from - The ID of the sending user.
 * @param {any} data - The signal data.
 */
function handleSignal(to, from, data) {
  if (to !== socket.id) {
    console.log(`[WebRTC Debug] Signal not for us (to: ${to}, our id: ${socket.id})`);
    return;
  }

  console.log(`[WebRTC Debug] Processing signal from ${from}, type: ${data.type || 'unknown'}`);
  let peer = peers[from];
  if (peer && peer.peerConnection) {
    console.log(`[WebRTC Debug] Existing peer connection found, signaling...`);
    peer.peerConnection.signal(data);
  } else {
    console.log(`[WebRTC Debug] No peer connection found, creating new one...`);
    createPeerConnection(from, false).then(pc => {
      peers[from] = { peerConnection: pc };
      console.log(`[WebRTC Debug] Signaling new peer connection...`);
      pc.signal(data);
    }).catch(error => {
      console.error(`[WebRTC Debug] Error creating peer connection for signal:`, error);
    });
  }
}

/**
 * Creates a new peer connection.
 * @function createPeerConnection
 * @param {string} theirSocketId - The socket ID of the peer.
 * @param {boolean} [isInitiator=false] - Whether the current client is the initiator.
 * @returns {Peer} The created peer connection.
 */
async function createPeerConnection(theirSocketId, isInitiator = false) {
  console.log(`[WebRTC Debug] Creating peer connection to ${theirSocketId}, initiator: ${isInitiator}`);
  
  if (!localMediaStream) {
    console.error("[WebRTC Debug] No local media stream available!");
    throw new Error("Local media stream not available");
  }

  const iceConfig = await loadIceConfig();
  console.log(`[WebRTC Debug] ICE config loaded with ${iceConfig.iceServers?.length || 0} servers`);

  const peerConnection = new Peer({
    initiator: isInitiator,
    trickle: true,
    config: { iceServers: iceConfig.iceServers }
  });

  console.log(`[WebRTC Debug] Peer connection created, adding local tracks...`);
  // 👉 Agregar las pistas LOCALES SIEMPRE antes de la negociación
  localMediaStream.getTracks().forEach(track => {
    console.log(`[WebRTC Debug] Adding local track: ${track.kind}, enabled: ${track.enabled}`);
    peerConnection.addTrack(track, localMediaStream);
  });

  // 👉 Enviar señales al otro usuario
  // 👉 Enviar señales al otro usuario (solo un canal)
  peerConnection.on("signal", (data) => {
    console.log(`[WebRTC Debug] Sending signal to ${theirSocketId}:`, {
      type: data.type || 'signal',
      to: theirSocketId,
      from: socket.id,
      hasSdp: !!data.sdp,
      hasCandidate: !!data.candidate
    });
    socket.emit("signal", theirSocketId, socket.id, data);
  });


  // 👉 Cuando llegue una pista REMOTA
  peerConnection.on("track", (track, stream) => {
    console.log(`[WebRTC Debug] Received remote track from ${theirSocketId}:`, {
      kind: track.kind,
      enabled: track.enabled,
      streamId: stream.id,
      streamActive: stream.active
    });
    updateRemoteStream(theirSocketId, stream);
  });

  peerConnection.on("connect", () => {
    console.log(`[WebRTC Debug] Peer connection established with ${theirSocketId}`);
  });

  peerConnection.on("error", (error) => {
    console.error(`[WebRTC Debug] Peer connection error with ${theirSocketId}:`, error);
  });

  peerConnection.on("close", () => {
    console.log(`[WebRTC Debug] Peer connection closed with ${theirSocketId}`);
  });

  return peerConnection;
}

/**
 * Disables the outgoing media stream.
 * @function disableOutgoingStream
 */
export function disableOutgoingStream() {
  if (!localMediaStream) return;
  localMediaStream.getAudioTracks().forEach((track) => {
    track.enabled = false;
  });
}

/**
 * Enables the outgoing media stream.
 * @function enableOutgoingStream
 */
export function enableOutgoingStream() {
  if (!localMediaStream) return;
  localMediaStream.getAudioTracks().forEach((track) => {
    track.enabled = true;
  });
}

function updateRemoteStream(_id, stream) {
  console.log(`[WebRTC Debug] Updating remote stream for peer ${_id}:`, {
    id: stream.id,
    active: stream.active,
    audioTracks: stream.getAudioTracks().length,
    videoTracks: stream.getVideoTracks().length,
  });
  remoteStreams[_id] = stream;
  notifyRemoteStreams();
}

function removeRemoteStream(_id) {
  if (remoteStreams[_id]) {
    delete remoteStreams[_id];
    notifyRemoteStreams();
  }
}

//enable video
export function enableOutgoingVideo() {
  if (!localMediaStream) return;
  localMediaStream.getVideoTracks().forEach((track) => {
    track.enabled = true;
  });
}

//disble video
export function disableOutgoingVideo() {
  if (!localMediaStream) return;
  localMediaStream.getVideoTracks().forEach((track) => {
    track.enabled = false;
  });
}
export function getLocalMediaStream() {
  return localMediaStream;
}
