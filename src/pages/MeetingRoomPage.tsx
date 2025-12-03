import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from "@utils/constants";
import { ChatPanel } from "@components/videoconference/ChatPanel";
import type { OnlineUser } from "@/hooks/useSocket";
import { useSocket } from "@/hooks/useSocket";
import { getUserIdFromToken } from "@/utils/auth";
import { generateMeetingCode } from "@/utils/meeting";
import { useWebRTC } from "@/hooks/useWebRTC";
// @ts-ignore - webrtc.js is a JavaScript file
import { getSocketId, setExternalSocket } from '../../webrtc.js'
import "../styles/MeetingRoom.scss";
import { userService } from "@services/userService";
import type { User } from "@/types";

export function MeetingRoomPage(): JSX.Element {
  const [meetingCode, setMeetingCode] = useState("");
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([]);
  const [userDirectory, setUserDirectory] = useState<Record<string, string>>(
    {}
  );
  const { id } = useParams();
  const currentUserId = getUserIdFromToken();
  const { remoteStreams, isReady, setMicEnabled, setVideoEnabled } =
    useWebRTC();

  // Obtener el socket del chat para usarlo también en WebRTC
  const { socket: chatSocket } = useSocket(
    currentUserId,
    meetingCode,
    setUsersOnline,
    () => {} // No necesitamos manejar mensajes aquí, ChatPanel lo hace
  );

  useEffect(() => {
    if (id) setMeetingCode(id);
    else setMeetingCode(generateMeetingCode());
  }, [id]);

  // Construye nombre legible (igual que ChatPanel)
  const buildDisplayName = (user: Partial<User>): string => {
    const first = user.firstName?.trim();
    const last = user.lastName?.trim();
    const fullName = [first, last].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (user.email) return user.email.split("@")[0];
    return "Usuario";
  };

  // Precargar nombre del usuario actual para evitar que se "reseteen" los nombres
  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await userService.getProfile();
        if (res?.data && !cancelled) {
          const name = buildDisplayName(res.data);
          setUserDirectory((prev) => ({ ...prev, [currentUserId]: name }));
        }
      } catch (err) {
        // noop
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    setMicEnabled(micOn);
  }, [micOn, setMicEnabled]);

  useEffect(() => {
    setVideoEnabled(camOn);
  }, [camOn, setVideoEnabled]);

  // Configurar el socket del chat para WebRTC cuando esté disponible
  useEffect(() => {
    if (chatSocket && chatSocket.connected) {
      console.log(
        "[MeetingRoom Debug] Setting chat socket for WebRTC signaling:",
        chatSocket.id
      );
      setExternalSocket(chatSocket);
    }
  }, [chatSocket]);

  // Conectar con otros usuarios cuando aparecen online (solo si WebRTC está listo)
  useEffect(() => {
    if (!isReady) {
      return;
    }

    const mySocketId = getSocketId();
    if (!mySocketId) {
      console.log("[MeetingRoom Debug] Waiting for WebRTC socket ID...");
      return;
    }

    // Conectar con cada usuario online que no sea nosotros
    usersOnline.forEach((user) => {
      if (user.socketId !== mySocketId) {
        console.log(`[MeetingRoom Debug] Attempting to connect to peer: ${user.socketId}`);
        
      }
    });
  }, [usersOnline, isReady]);

  function toggleMic() {
    setMicOn((s) => !s);
  }

  function toggleCam() {
    setCamOn((s) => !s);
  }

  async function hangup() {
    console.log("ID de reunión que estoy enviando:", meetingCode);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/meetings/finish/${meetingCode}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", res.status);
    } catch (error) {
      console.error("Error al registrar finalización de la reunión:", error);
    }

    navigate(ROUTES.CREATE_MEETING);
  }

  const getUserDisplayName = (userId: string): string => {
    if (userDirectory[userId]) {
      return userDirectory[userId];
    }
    if (userId.includes("@")) {
      const name = userId.split("@")[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return userId.length > 8
      ? `Usuario ${userId.substring(0, 4)}`
      : `Usuario ${userId}`;
  };

  const getUserInitials = (userId: string): string => {
    if (userDirectory[userId]) {
      const parts = userDirectory[userId].split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
      }
      return userDirectory[userId].substring(0, 2).toUpperCase();
    }
    if (userId.includes("@")) {
      const name = userId.split("@")[0];
      return name.substring(0, 2).toUpperCase();
    }
    return userId.substring(0, 2).toUpperCase();
  };

  // estado para abrir chat en móvil
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <strong className="text-sm">Código de la reunión:</strong>
          <span className="font-mono text-sm">{meetingCode}</span>

          {/* --- Añadir estado de media y contador de audios --- */}
          <span className={`media-status ${isReady ? 'media-status--ready' : 'media-status--loading'}`}>
            {isReady ? 'Audio conectado' : 'Conectando audio...'}
          </span>
          {Object.keys(remoteStreams).length > 0 && (
            <span className="remote-audio-status" title={`${Object.keys(remoteStreams).length} conexión(es) de audio activa(s)`}>
              {Object.keys(remoteStreams).length} audio(s)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="md:hidden px-4 py-1 bg-[#cfe6e3] rounded-lg text-sm"
            onClick={() => setIsChatOpen(true)}
            aria-label="Abrir chat"
          >
            Chat
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        <main className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {usersOnline.length === 0 ? (
              <div className="user-tile user-tile--empty flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow">
                <div className="avatar mb-2" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="28"
                    height="28"
                    className="avatar__icon"
                  >
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 1.791-7 4v1h14v-1c0-2.209-3.134-4-7-4z" />
                  </svg>
                </div>
                <span className="text-gray-600">Esperando usuarios...</span>
              </div>
            ) : (
              usersOnline.map((user) => {
                const isCurrentUser = user.userId === currentUserId;
                const displayName = getUserDisplayName(user.userId);
                const initials = getUserInitials(user.userId);

                return (
                  <div
                    className={`user-tile p-4 bg-white rounded-lg shadow flex flex-col items-center gap-2 ${
                      isCurrentUser ? "ring-2 ring-indigo-300" : ""
                    }`}
                    key={user.socketId}
                    title={isCurrentUser ? `${displayName} (Tú)` : displayName}
                  >
                    <div className="avatar" aria-hidden="true">
                      <div
                        className={`avatar-initials flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-lg font-medium ${
                          isCurrentUser ? "bg-indigo-500 text-white" : ""
                        }`}
                      >
                        {initials}
                      </div>
                    </div>
                    <span className="text-sm text-center">
                      {isCurrentUser ? `${displayName} (Tú)` : displayName}
                    </span>
                    {isCurrentUser && (
                      <span className="user-badge text-xs px-2 py-0.5 bg-indigo-100 rounded">
                        Tú
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </main>

        <RemoteAudioPlayers streams={remoteStreams} />

        <aside className="hidden md:block w-80 border-l bg-white">
          <ChatPanel
            meetingId={meetingCode}
            onUsersOnlineChange={setUsersOnline}
            onUserDirectoryChange={(dir) =>
              setUserDirectory((prev) => ({ ...prev, ...dir }))
            }
          />
        </aside>

        {isChatOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setIsChatOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 right-0 w-80 bg-white z-50 shadow-lg overflow-hidden md:hidden">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="font-medium">Chat</h3>
                <button
                  className="text-sm px-2 py-1"
                  onClick={() => setIsChatOpen(false)}
                >
                  Cerrar
                </button>
              </div>
              <RemoteAudioPlayers streams={remoteStreams} />
              <div className="h-full">
                <ChatPanel
                  meetingId={meetingCode}
                  onUsersOnlineChange={setUsersOnline}
                  onUserDirectoryChange={(dir) =>
                    setUserDirectory((prev) => ({ ...prev, ...dir }))
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="flex items-center justify-center gap-4 p-3 bg-white border-t meeting-footer">
        <button
          aria-label="Mic"
          aria-pressed={!micOn}
          onClick={toggleMic}
          className={`px-3 py-2 rounded ${
            micOn ? "bg-gray-100" : "bg-red-100"
          }`}
          title={micOn ? "Silenciar" : "Activar micrófono"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21h-3a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-3.08A7 7 0 0 0 19 11z" />
          </svg>
        </button>

        <button
          aria-label="Camera"
          aria-pressed={!camOn}
          onClick={toggleCam}
          className={`px-3 py-2 rounded ${
            camOn ? "bg-gray-100" : "bg-red-100"
          }`}
          title={camOn ? "Apagar cámara" : "Encender cámara"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M4 7h3l2-2h6l2 2h3v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          </svg>
        </button>

        <button
          aria-label="EndCall"
          onClick={hangup}
          title="Colgar"
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
            aria-hidden="true"
          >
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.48 2.53.74 3.89.74a1 1 0 011 1V22a1 1 0 01-1 1C10.07 23 2 14.93 2 4.5A1 1 0 013 3.5H6.5a1 1 0 011 1c0 1.36.26 2.68.74 3.89a1 1 0 01-.21 1.11l-2.2 2.2z" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

function RemoteAudioPlayers({
  streams,
}: {
  streams: Record<string, MediaStream>;
}) {
  const entries = Object.entries(streams);

  useEffect(() => {
    console.log(`[Audio Debug] Total remote streams: ${entries.length}`);
    entries.forEach(([peerId, stream]) => {
      const audioTracks = stream.getAudioTracks();
      console.log(`[Audio Debug] Peer ${peerId}:`, {
        audioTracks: audioTracks.length,
        enabled: audioTracks.map((t) => t.enabled),
        muted: audioTracks.map((t) => t.muted),
        readyState: audioTracks.map((t) => t.readyState),
      });
    });
  }, [entries.length]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="audio-bridge" aria-hidden="true">
      {entries.map(([peerId, stream]) => (
        <AudioBridge key={peerId} peerId={peerId} stream={stream} />
      ))}
    </div>
  );
}

function AudioBridge({
  peerId,
  stream,
}: {
  peerId: string;
  stream: MediaStream;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      console.log(`[Audio Debug] Setting up audio for peer ${peerId}`);
      audioRef.current.srcObject = stream;
      audioRef.current.volume = 1;

      // Verificar si el stream tiene tracks de audio
      const audioTracks = stream.getAudioTracks();
      setHasAudio(
        audioTracks.length > 0 &&
          audioTracks.some((track) => track.enabled && !track.muted)
      );

      // Intentar reproducir
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => {
            console.log(`[Audio Debug] Audio playing for peer ${peerId}`);
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error(
              `[Audio Debug] Unable to autoplay remote audio stream for peer ${peerId}:`,
              error
            );
            setIsPlaying(false);
          });
      }

      // Escuchar eventos del audio
      const handlePlay = () => {
        console.log(`[Audio Debug] Audio started playing for peer ${peerId}`);
        setIsPlaying(true);
      };
      const handlePause = () => {
        console.log(`[Audio Debug] Audio paused for peer ${peerId}`);
        setIsPlaying(false);
      };
      const handleVolumeChange = () => {
        if (audioRef.current) {
          console.log(`[Audio Debug] Volume changed for peer ${peerId}:`, {
            volume: audioRef.current.volume,
            muted: audioRef.current.muted,
          });
        }
      };

      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
      audioRef.current.addEventListener("volumechange", handleVolumeChange);

      // Escuchar cambios en los tracks del stream
      stream.getAudioTracks().forEach((track) => {
        track.addEventListener("ended", () => {
          console.log(`[Audio Debug] Audio track ended for peer ${peerId}`);
          setHasAudio(false);
        });
        track.addEventListener("mute", () => {
          console.log(`[Audio Debug] Audio track muted for peer ${peerId}`);
          setHasAudio(false);
        });
        track.addEventListener("unmute", () => {
          console.log(`[Audio Debug] Audio track unmuted for peer ${peerId}`);
          setHasAudio(true);
        });
      });

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener("play", handlePlay);
          audioRef.current.removeEventListener("pause", handlePause);
          audioRef.current.removeEventListener(
            "volumechange",
            handleVolumeChange
          );
        }
      };
    }
  }, [stream, peerId]);

  // Log de estado del audio
  useEffect(() => {
    if (isPlaying && hasAudio) {
      console.log(`[Audio Debug] (ok) Peer ${peerId} - Audio activo y reproduciéndose`)
    }
  }, [isPlaying, hasAudio, peerId]);

  return (
    <audio 
      ref={audioRef} 
      autoPlay 
      playsInline 
      style={{ display: 'none' }}
    />
  )
}
