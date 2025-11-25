import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from '@utils/constants'
import { ChatPanel } from '@components/videoconference/ChatPanel'
import type { OnlineUser } from '@/hooks/useSocket'
import { getUserIdFromToken } from '@/utils/auth'
import { generateMeetingCode } from '@/utils/meeting'
import "../styles/MeetingRoom.scss";

export function MeetingRoomPage(): JSX.Element {
  const [meetingCode, setMeetingCode] = useState("");
  const [usersOnline, setUsersOnline] = useState<OnlineUser[]>([]);
  const [userDirectory, setUserDirectory] = useState<Record<string, string>>({});
  const { id } = useParams();
  const currentUserId = getUserIdFromToken();

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

  function hangup() {
    navigate(ROUTES.CREATE_MEETING)
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
                </div>
              )
            })
          )}
        </main>

        
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
