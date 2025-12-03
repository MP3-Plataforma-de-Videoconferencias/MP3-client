import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from '@utils/constants'
import { ChatPanel } from '@components/videoconference/ChatPanel'
import type { OnlineUser } from '@/hooks/useSocket'
import { getUserIdFromToken } from '@/utils/auth'
import { generateMeetingCode } from '@/utils/meeting'
import "../styles/MeetingRoom.scss";
import { userService } from '@services/userService'
import type { User } from '@/types'

export function MeetingRoomPage(): JSX.Element {
  const [meetingCode, setMeetingCode] = useState("");
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([]);
  const [userDirectory, setUserDirectory] = useState<Record<string, string>>({});
  const { id } = useParams();
  const currentUserId = getUserIdFromToken();

  // nuevo estado para mobile chat
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (id) setMeetingCode(id);
    else setMeetingCode(generateMeetingCode());
  }, [id]);

  const navigate = useNavigate()
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

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

  // Construye nombre legible similar al ChatPanel
  const buildDisplayName = (user: Partial<User>): string => {
    const first = user.firstName?.trim()
    const last = user.lastName?.trim()
    const fullName = [first, last].filter(Boolean).join(' ').trim()
    if (fullName) return fullName
    if (user.email) return user.email.split('@')[0]
    return 'Usuario'
  }

  // Precarga nombre del usuario actual para evitar parpadeos / reemplazos
  useEffect(() => {
    if (!currentUserId) return
    let cancelled = false
    void (async () => {
      try {
        const res = await userService.getProfile()
        if (res?.data && !cancelled) {
          const name = buildDisplayName(res.data)
          setUserDirectory(prev => ({ ...prev, [currentUserId]: name }))
        }
      } catch (err) {
        // no-op
      }
    })()
    return () => { cancelled = true }
  }, [currentUserId])

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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <strong className="text-sm">Código de la reunión:</strong>
          <span className="font-mono text-sm">{meetingCode}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* botón para abrir chat en móvil */}
          <button
            className="md:hidden px-3 py-1 bg-[#cfe6e3] rounded-lg text-sm"
            onClick={() => setIsChatOpen(true)}
            aria-label="Abrir chat"
          >
            Chat
          </button>

          <button
            aria-label="EndCall"
            onClick={hangup}
            title="Colgar"
            className="px-3 py-1 bg-red-500 text-white rounded-md"
          >
            Colgar
          </button>
        </div>
      </header>

      {/* AREA CENTRAL: scrolleable */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Main grid: responsive */}
        <main className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {usersOnline.length === 0 ? (
              <div className="user-tile user-tile--empty flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow">
                <div className="avatar mb-2" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" className="avatar__icon">
                    <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 1.791-7 4v1h14v-1c0-2.209-3.134-4-7-4z" />
                  </svg>
                </div>
                <span className="text-gray-600">Esperando usuarios...</span>
              </div>
            ) : (
              usersOnline.map((user) => {
                const isCurrentUser = user.userId === currentUserId
                const displayName = getUserDisplayName(user.userId)
                const initials = getUserInitials(user.userId)
                
                return (
                  <div 
                    className={`user-tile p-4 bg-white rounded-lg shadow flex flex-col items-center gap-2 ${isCurrentUser ? 'ring-2 ring-indigo-300' : ''}`}
                    key={user.socketId}
                    title={isCurrentUser ? `${displayName} (Tú)` : displayName}
                  >
                    <div className="avatar" aria-hidden="true">
                      <div className={`avatar-initials flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-lg font-medium ${isCurrentUser ? 'bg-indigo-500 text-white' : ''}`}>
                        {initials}
                      </div>
                    </div>
                    <span className="text-sm text-center">{isCurrentUser ? `${displayName} (Tú)` : displayName}</span>
                    {isCurrentUser && (
                      <span className="user-badge text-xs px-2 py-0.5 bg-indigo-100 rounded">Tú</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </main>

        {/* Chat en escritorio como sidebar */}
        <aside className="hidden md:block w-80 border-l bg-white">
          <ChatPanel 
            meetingId={meetingCode} 
            onUsersOnlineChange={setUsersOnline}
            onUserDirectoryChange={(dir) => setUserDirectory(prev => ({ ...prev, ...dir }))}
          />
        </aside>

        {/* Chat panel para móvil (drawer) */}
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
                <button className="text-sm px-2 py-1" onClick={() => setIsChatOpen(false)}>Cerrar</button>
              </div>
              <div className="h-full">
                <ChatPanel 
                  meetingId={meetingCode} 
                  onUsersOnlineChange={setUsersOnline}
                  onUserDirectoryChange={(dir) => setUserDirectory(prev => ({ ...prev, ...dir }))}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <footer className="flex items-center justify-center gap-4 p-3 bg-white border-t">
        <button
          aria-label="Mic"
          aria-pressed={!micOn}
          onClick={toggleMic}
          className={`px-3 py-2 rounded ${micOn ? 'bg-gray-100' : 'bg-red-100'}`}
          title={micOn ? 'Silenciar' : 'Activar micrófono'}
        >
          Mic
        </button>

        <button
          aria-label="Camera"
          aria-pressed={!camOn}
          onClick={toggleCam}
          className={`px-3 py-2 rounded ${camOn ? 'bg-gray-100' : 'bg-red-100'}`}
          title={camOn ? 'Apagar cámara' : 'Encender cámara'}
        >
          Cam
        </button>

        <button aria-label="EndCall" onClick={hangup} title="Colgar" className="px-4 py-2 bg-red-600 text-white rounded">
          Colgar
        </button>
      </footer>
    </div>
  );
}
