import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ROUTES } from '@utils/constants'
import "../styles/MeetingRoom.scss";

export function MeetingRoomPage(): JSX.Element {
  const [meetingCode, setMeetingCode] = useState("");
  const { id } = useParams();

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const block = () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

    return `${block()}-${block()}`;
  };
  useEffect(() => {
    if (id) setMeetingCode(id);
    else setMeetingCode(generateCode());
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

  return (
    <div className="meeting-container">
      <header className="meeting-header">
        <strong>Código de la reunión:</strong> {meetingCode}
      </header>

      {/* AREA CENTRAL: esta es la única área scrolleable */}
      <div className="meeting-scroll-area">
        <main className="meeting-grid">
          {[...Array(9)].map((_, i) => (
            <div className="user-tile" key={i}>
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
              <span>Usuario {i + 1}</span>
            </div>
          ))}
        </main>

        
        <aside className="meeting-chat" aria-label="Chat grupal">
          <h4>Chat grupal</h4>
          <div className="chat-box">
            <p><b>Usuario 1:</b> Buenos días</p>
            <p><b>Usuario 2:</b> Hola</p>
          </div>
          <input placeholder="Escribir mensaje..." />
        </aside>
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
