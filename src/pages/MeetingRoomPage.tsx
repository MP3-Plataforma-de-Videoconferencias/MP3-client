import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from '@utils/constants'
import { ChatPanel } from '@components/videoconference/ChatPanel'
import type { OnlineUser } from '@/hooks/useSocket'
import { useSocket } from '@/hooks/useSocket'
import { getUserIdFromToken } from '@/utils/auth'
import { generateMeetingCode } from '@/utils/meeting'
import { useWebRTC } from '@/hooks/useWebRTC'
// @ts-ignore - webrtc.js is a JavaScript file
import { getSocketId, setExternalSocket } from '../../webrtc.js'
import "../styles/MeetingRoom.scss";

export function MeetingRoomPage(): JSX.Element {
  const [meetingCode, setMeetingCode] = useState("");
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([]);
  const [userDirectory, setUserDirectory] = useState<Record<string, string>>({});
  const { id } = useParams();
  const currentUserId = getUserIdFromToken();
  const { remoteStreams, isReady, setMicEnabled, setVideoEnabled } = useWebRTC();
  
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

  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  useEffect(() => {
    setMicEnabled(micOn)
  }, [micOn, setMicEnabled])

  useEffect(() => {
    setVideoEnabled(camOn)
  }, [camOn, setVideoEnabled])

  // Configurar el socket del chat para WebRTC cuando esté disponible
  useEffect(() => {
    if (chatSocket && chatSocket.connected) {
      console.log('[MeetingRoom Debug] Setting chat socket for WebRTC signaling:', chatSocket.id);
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
      console.log('[MeetingRoom Debug] Waiting for WebRTC socket ID...');
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
    setMicOn((s) => !s)
  }

  function toggleCam() {
    setCamOn((s) => !s)
  }

  async function hangup() {
  console.log("ID de reunión que estoy enviando:", meetingCode);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/finish/${meetingCode}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("Respuesta del servidor:", res.status);

  } catch (error) {
    console.error("Error al registrar finalización de la reunión:", error);
  }

  navigate(ROUTES.CREATE_MEETING);
}


  const getUserDisplayName = (userId: string): string => {
    if (userDirectory[userId]) {
      return userDirectory[userId]
    }
    if (userId.includes('@')) {
      const name = userId.split('@')[0]
      return name.charAt(0).toUpperCase() + name.slice(1)
    }
    return userId.length > 8 ? `Usuario ${userId.substring(0, 4)}` : `Usuario ${userId}`
  }

  const getUserInitials = (userId: string): string => {
    if (userDirectory[userId]) {
      const parts = userDirectory[userId].split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
      }
      return userDirectory[userId].substring(0, 2).toUpperCase()
    }
    if (userId.includes('@')) {
      const name = userId.split('@')[0]
      return name.substring(0, 2).toUpperCase()
    }
    return userId.substring(0, 2).toUpperCase()
  }

  return (
    <div className="meeting-container">
      <header className="meeting-header">
        <strong>Código de la reunión:</strong> {meetingCode}
        <span className={`media-status ${isReady ? 'media-status--ready' : 'media-status--loading'}`}>
          {isReady ? 'Audio conectado' : 'Conectando audio...'}
        </span>
        {Object.keys(remoteStreams).length > 0 && (
          <span className="remote-audio-status" title={`${Object.keys(remoteStreams).length} conexión(es) de audio activa(s)`}>
            {Object.keys(remoteStreams).length} audio(s)
          </span>
        )}
      </header>

      {/* AREA CENTRAL: esta es la única área scrolleable */}
      <div className="meeting-scroll-area">
        <main className="meeting-grid">
          {usersOnline.length === 0 ? (
            <div className="user-tile user-tile--empty">
              <div className="avatar" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="28"
                  height="28"
                  className="avatar__icon"
                  aria-hidden="true"
                >
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 1.791-7 4v1h14v-1c0-2.209-3.134-4-7-4z" />
                </svg>
              </div>
              <span>Esperando usuarios...</span>
            </div>
          ) : (
            usersOnline.map((user) => {
              const isCurrentUser = user.userId === currentUserId
              const displayName = getUserDisplayName(user.userId)
              const initials = getUserInitials(user.userId)
              const audioStreamCount = Object.keys(remoteStreams).length
              
              return (
                <div 
                  className={`user-tile ${isCurrentUser ? 'user-tile--current' : ''}`}
                  key={user.socketId}
                  title={isCurrentUser ? `${displayName} (Tú)` : displayName}
                >
                  <div className="avatar" aria-hidden="true">
                    {isCurrentUser ? (
                      <div className="avatar-initials avatar-initials--current">
                        {initials}
                      </div>
                    ) : (
                      <div className="avatar-initials">
                        {initials}
                      </div>
                    )}
                  </div>
                  <span>{isCurrentUser ? `${displayName} (Tú)` : displayName}</span>
                  {isCurrentUser && (
                    <span className="user-badge" aria-label="Usuario actual">Tú</span>
                  )}
                  {!isCurrentUser && audioStreamCount > 0 && (
                    <span className="audio-indicator" title="Audio activo" aria-label="Audio activo">
                      (Audio activo)
                    </span>
                  )}
                </div>
              )
            })
          )}
        </main>

        <RemoteAudioPlayers streams={remoteStreams} />

        <ChatPanel 
          meetingId={meetingCode} 
          onUsersOnlineChange={setUsersOnline}
          onUserDirectoryChange={setUserDirectory}
        />
      </div>

      
      <footer className="meeting-footer">
        <button
          aria-label="Mic"
          aria-pressed={!micOn}
          onClick={toggleMic}
          className={micOn ? '' : 'off'}
          title={micOn ? 'Silenciar' : 'Activar micrófono'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21h-3a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-3.08A7 7 0 0 0 19 11z" />
          </svg>
        </button>

        <button
          aria-label="Camera"
          aria-pressed={!camOn}
          onClick={toggleCam}
          className={camOn ? '' : 'off'}
          title={camOn ? 'Apagar cámara' : 'Encender cámara'}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path d="M4 7h3l2-2h6l2 2h3v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
          </svg>
        </button>

        <button aria-label="EndCall" onClick={hangup} title="Colgar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.48 2.53.74 3.89.74a1 1 0 011 1V22a1 1 0 01-1 1C10.07 23 2 14.93 2 4.5A1 1 0 013 3.5H6.5a1 1 0 011 1c0 1.36.26 2.68.74 3.89a1 1 0 01-.21 1.11l-2.2 2.2z" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

function RemoteAudioPlayers({ streams }: { streams: Record<string, MediaStream> }) {
  const entries = Object.entries(streams)

  useEffect(() => {
    console.log(`[Audio Debug] Total remote streams: ${entries.length}`)
    entries.forEach(([peerId, stream]) => {
      const audioTracks = stream.getAudioTracks()
      console.log(`[Audio Debug] Peer ${peerId}:`, {
        audioTracks: audioTracks.length,
        enabled: audioTracks.map(t => t.enabled),
        muted: audioTracks.map(t => t.muted),
        readyState: audioTracks.map(t => t.readyState),
      })
    })
  }, [entries.length])

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="audio-bridge" aria-hidden="true">
      {entries.map(([peerId, stream]) => (
        <AudioBridge key={peerId} peerId={peerId} stream={stream} />
      ))}
    </div>
  )
}

function AudioBridge({ peerId, stream }: { peerId: string; stream: MediaStream }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasAudio, setHasAudio] = useState(false)

  useEffect(() => {
    if (audioRef.current) {
      console.log(`[Audio Debug] Setting up audio for peer ${peerId}`)
      audioRef.current.srcObject = stream
      audioRef.current.volume = 1
      
      // Verificar si el stream tiene tracks de audio
      const audioTracks = stream.getAudioTracks()
      setHasAudio(audioTracks.length > 0 && audioTracks.some(track => track.enabled && !track.muted))
      
      // Intentar reproducir
      const playPromise = audioRef.current.play()
      if (playPromise) {
        playPromise
          .then(() => {
            console.log(`[Audio Debug] Audio playing for peer ${peerId}`)
            setIsPlaying(true)
          })
          .catch((error) => {
            console.error(`[Audio Debug] Unable to autoplay remote audio stream for peer ${peerId}:`, error)
            setIsPlaying(false)
          })
      }

      // Escuchar eventos del audio
      const handlePlay = () => {
        console.log(`[Audio Debug] Audio started playing for peer ${peerId}`)
        setIsPlaying(true)
      }
      const handlePause = () => {
        console.log(`[Audio Debug] Audio paused for peer ${peerId}`)
        setIsPlaying(false)
      }
      const handleVolumeChange = () => {
        if (audioRef.current) {
          console.log(`[Audio Debug] Volume changed for peer ${peerId}:`, {
            volume: audioRef.current.volume,
            muted: audioRef.current.muted,
          })
        }
      }

      audioRef.current.addEventListener('play', handlePlay)
      audioRef.current.addEventListener('pause', handlePause)
      audioRef.current.addEventListener('volumechange', handleVolumeChange)

      // Escuchar cambios en los tracks del stream
      stream.getAudioTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.log(`[Audio Debug] Audio track ended for peer ${peerId}`)
          setHasAudio(false)
        })
        track.addEventListener('mute', () => {
          console.log(`[Audio Debug] Audio track muted for peer ${peerId}`)
          setHasAudio(false)
        })
        track.addEventListener('unmute', () => {
          console.log(`[Audio Debug] Audio track unmuted for peer ${peerId}`)
          setHasAudio(true)
        })
      })

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('play', handlePlay)
          audioRef.current.removeEventListener('pause', handlePause)
          audioRef.current.removeEventListener('volumechange', handleVolumeChange)
        }
      }
    }
  }, [stream, peerId])

  // Log de estado del audio
  useEffect(() => {
    if (isPlaying && hasAudio) {
      console.log(`[Audio Debug] (ok) Peer ${peerId} - Audio activo y reproduciéndose`)
    }
  }, [isPlaying, hasAudio, peerId])

  return (
    <audio 
      ref={audioRef} 
      autoPlay 
      playsInline 
      style={{ display: 'none' }}
    />
  )
}