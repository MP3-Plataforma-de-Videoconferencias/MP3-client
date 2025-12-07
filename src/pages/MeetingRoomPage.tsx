import { useEffect, useRef, useState, useMemo } from "react";
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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { id } = useParams();
  const currentUserId = getUserIdFromToken();
  const { localStream, remoteStreams, isReady, setMicEnabled, setVideoEnabled } = useWebRTC();
  
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

  // Crear un mapeo de usuarios a streams remotos
  // Esto asegura que cada usuario se mapee correctamente con su stream
  // Nota: Los socketIds del chat pueden no coincidir con los socketIds de WebRTC,
  // por lo que hacemos un mapeo más flexible
  const userStreamMap = useMemo(() => {
    const map = new Map<string, MediaStream>()
    const remoteUsers = usersOnline.filter(u => u.userId !== currentUserId)
    const streamEntries = Object.entries(remoteStreams)
    const streamsArray = streamEntries.map(([_, stream]) => stream)
    
    // Primero intentar mapear por socketId exacto (caso ideal)
    remoteUsers.forEach(user => {
      const stream = remoteStreams[user.socketId]
      if (stream) {
        map.set(user.socketId, stream)
      }
    })
    
    // Si hay usuarios sin mapear y streams disponibles, mapearlos
    const mappedStreams = new Set(Array.from(map.values()))
    const unmappedUsers = remoteUsers.filter(u => !map.has(u.socketId))
    const unmappedStreams = streamsArray.filter(stream => !mappedStreams.has(stream))
    
    // Mapear usuarios sin stream con streams disponibles
    // Esto maneja el caso donde los socketIds no coinciden exactamente
    unmappedUsers.forEach((user, index) => {
      if (index < unmappedStreams.length) {
        map.set(user.socketId, unmappedStreams[index])
        console.log(`[Video Debug] Mapped user ${user.socketId} (${user.userId}) to stream ${unmappedStreams[index].id}`)
      }
    })
    
    return map
  }, [usersOnline, remoteStreams, currentUserId])

  // Debug: mostrar información de streams y usuarios
  useEffect(() => {
    const mySocketId = getSocketId();
    console.log('[Video Debug] ========== STREAMS DEBUG ==========')
    console.log('[Video Debug] My WebRTC socketId:', mySocketId)
    console.log('[Video Debug] Users online:', usersOnline.map(u => ({
      socketId: u.socketId,
      userId: u.userId,
      isCurrent: u.userId === currentUserId
    })))
    console.log('[Video Debug] Remote streams keys:', Object.keys(remoteStreams))
    console.log('[Video Debug] Remote streams details:', Object.entries(remoteStreams).map(([peerId, stream]) => ({
      peerId,
      hasVideo: stream.getVideoTracks().length > 0,
      hasAudio: stream.getAudioTracks().length > 0,
      videoEnabled: stream.getVideoTracks().some(t => t.enabled)
    })))
    console.log('[Video Debug] User-Stream map:', Array.from(userStreamMap.entries()).map(([socketId, stream]) => ({
      socketId,
      hasVideo: stream.getVideoTracks().length > 0,
      hasAudio: stream.getAudioTracks().length > 0
    })))
    console.log('[Video Debug] Local stream:', localStream ? {
      hasVideo: localStream.getVideoTracks().length > 0,
      hasAudio: localStream.getAudioTracks().length > 0
    } : 'null')
    console.log('[Video Debug] ====================================')
  }, [usersOnline, remoteStreams, localStream, currentUserId, userStreamMap])

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

  useEffect(() => {
  if (!meetingCode) return;

  fetch(`${import.meta.env.VITE_API_URL}/api/participants/${meetingCode}`)
    .then(res => res.json())
    .then((participants: { userId: string; name: string }[]) => {
      const onlineUsers: OnlineUser[] = participants.map(p => ({
        userId: p.userId,
        socketId: '',
        presenceId: p.userId, 
      }));
      setUsersOnline(onlineUsers);

      const directory: Record<string, string> = {};
      participants.forEach(p => {
        if (p.name) directory[p.userId] = p.name;
      });
      setUserDirectory(directory);
    })
    .catch(err => console.error('Error fetching participants:', err));
}, [meetingCode]);

useEffect(() => {
  if (!currentUserId || !meetingCode) return;

  fetch(`${import.meta.env.VITE_API_URL}/users/${currentUserId}`)
    .then(res => res.json())
    .then(userData => {
  
      localStorage.setItem('userEmail', userData.email);

      const participant = {
        meetingId: meetingCode,
        userId: currentUserId,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
      };

      fetch(`${import.meta.env.VITE_API_URL}/api/participants/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(participant),
      })
      .then(() => console.log('Participant registered:', participant))
      .catch(err => console.error('Error registering participant:', err));
    });
}, [currentUserId, meetingCode]);


  function toggleMic() {
    setMicOn((s) => !s)
  }

  function toggleCam() {
    setCamOn((s) => !s)
  }

async function hangup() {
  if (!meetingCode) return;

  try {
    console.log("Finalizando reunión:", meetingCode);

    await fetch(`${import.meta.env.VITE_API_URL}/api/meetings/finish/${meetingCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });

    
    await fetch(`${import.meta.env.VITE_API_URL}/api/participants/finish/${meetingCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: localStorage.getItem('userEmail') }),
    });

    console.log("Correo de resumen enviado al participante que finalizó.");

    navigate(ROUTES.CREATE_MEETING);
  } catch (err) {
    console.error("Error al finalizar la reunión:", err);
  }
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
      </header>

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
              // const audioStreamCount = Object.keys(remoteStreams).length
              
              // Obtener el stream de video correspondiente
              // Para el usuario actual, usar localStream
              // Para otros usuarios, usar el mapeo userStreamMap
              let videoStream = null
              if (isCurrentUser) {
                videoStream = localStream
              } else {
                // Intentar obtener del mapeo
                videoStream = userStreamMap.get(user.socketId)
                
                // Si no está en el mapeo, intentar buscar directamente por socketId
                if (!videoStream) {
                  videoStream = remoteStreams[user.socketId]
                }
                
                // Si aún no se encuentra y hay streams disponibles, usar el primero disponible
                // Esto es un fallback para casos donde el mapeo no funcionó
                if (!videoStream && Object.keys(remoteStreams).length > 0) {
                  const availableStreams = Object.values(remoteStreams).filter(
                    stream => stream.getVideoTracks().length > 0
                  )
                  if (availableStreams.length > 0) {
                    // Si solo hay un stream disponible y un usuario remoto, usarlo
                    const remoteUsersCount = usersOnline.filter(u => u.userId !== currentUserId).length
                    if (remoteUsersCount === 1 && availableStreams.length === 1) {
                      videoStream = availableStreams[0]
                    }
                  }
                }
              }
              
              return (
                <div 
                  className={`user-tile ${isCurrentUser ? 'user-tile--current' : ''}`}
                  key={user.socketId}
                  title={isCurrentUser ? `${displayName} (Tú)` : displayName}
                >
                  {videoStream && videoStream.getVideoTracks().length > 0 ? (
                    <div className="video-container">
                      <VideoPlayer 
                        stream={videoStream} 
                        isLocal={isCurrentUser}
                        displayName={displayName}
                      />
                      <div className="video-name-overlay">
                        {isCurrentUser ? `${displayName} (Tú)` : displayName}
                      </div>
                    </div>
                  ) : (
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
                  )}
                  {!videoStream && <span>{isCurrentUser ? `${displayName} (Tú)` : displayName}</span>}
                  {isCurrentUser && (
                    <span className="user-badge" aria-label="Usuario actual">Tú</span>
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
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
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

        {window.innerWidth < 1024 && (
          <button 
            aria-label="Chat"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={isChatOpen ? 'active' : ''}
            title={isChatOpen ? 'Cerrar chat' : 'Abrir chat'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
          </button>
        )}

        <button aria-label="EndCall" onClick={hangup} title="Colgar">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" aria-hidden="true">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.21.48 2.53.74 3.89.74a1 1 0 011 1V22a1 1 0 01-1 1C10.07 23 2 14.93 2 4.5A1 1 0 013 3.5H6.5a1 1 0 011 1c0 1.36.26 2.68.74 3.89a1 1 0 01-.21 1.11l-2.2 2.2z" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

function VideoPlayer({ stream, isLocal, displayName }: { stream: MediaStream; isLocal: boolean; displayName: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasActiveVideo, setHasActiveVideo] = useState(false)

  useEffect(() => {
    if (!stream) {
      setHasActiveVideo(false)
      return
    }

    // Verificar si hay video tracks activos
    const checkVideoTracks = () => {
      const videoTracks = stream.getVideoTracks()
      const hasActive = videoTracks.length > 0 && videoTracks.some(track => track.enabled)
      console.log(`[VideoPlayer] ${displayName} - hasActiveVideo:`, hasActive, 'tracks:', videoTracks.map(t => ({ enabled: t.enabled, readyState: t.readyState })))
      setHasActiveVideo(hasActive)
    }

    checkVideoTracks()

    // Monitorear cambios en los tracks
    const videoTracks = stream.getVideoTracks()
    const handleTrackChange = () => {
      console.log(`[VideoPlayer] Track changed for ${displayName}`)
      checkVideoTracks()
    }
    
    videoTracks.forEach(track => {
      track.addEventListener('ended', handleTrackChange)
      track.addEventListener('mute', handleTrackChange)
      track.addEventListener('unmute', handleTrackChange)
    })

    // Intervalo para verificar periódicamente
    const interval = setInterval(checkVideoTracks, 500)

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.muted = isLocal
      videoRef.current.playsInline = true
      
      const playPromise = videoRef.current.play()
      if (playPromise) {
        playPromise.catch((error) => {
          console.error(`[Video Debug] Unable to play video stream:`, error)
        })
      }
    }

    return () => {
      clearInterval(interval)
      videoTracks.forEach(track => {
        track.removeEventListener('ended', handleTrackChange)
        track.removeEventListener('mute', handleTrackChange)
        track.removeEventListener('unmute', handleTrackChange)
      })
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }, [stream, isLocal, displayName])

  // Obtener iniciales para el avatar
  const getInitials = (name: string): string => {
    const parts = name.replace(' (Tú)', '').split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="user-tile__video"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '8px',
          display: hasActiveVideo ? 'block' : 'none',
          background: '#000'
        }}
        aria-label={`Video de ${displayName}`}
      />
      {!hasActiveVideo && (
        <div className="avatar" aria-hidden="true">
          <div className="avatar-initials">
            {getInitials(displayName)}
          </div>
        </div>
      )}
    </>
  )
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
      console.log(`[Audio Debug] ✅ Peer ${peerId} - Audio activo y reproduciéndose`)
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

