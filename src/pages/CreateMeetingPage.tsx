import "../styles/CreateMeetingPage.scss";
import { meetingService } from "@/services/meetingService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function CreateMeetingPage(): JSX.Element {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateMeeting = async () => {
    try {
      setLoading(true);

    const response = await meetingService.create();

    if (response.data?.ok && response.data?.meetingId) {
      const id = response.data.meetingId;
      navigate(`/meetings/${id}`);
    } else {
      alert("Error al crear la reunión");
    }

    } catch (error) {
      console.error(error);
      alert("Error al crear la reunión");
    } finally {
      setLoading(false);
    }
  };

  const [joinCode, setJoinCode] = useState("");

  const handleJoin = () => {
    if (!joinCode.trim()) {
      alert("Ingresa un código de reunión");
      return;
    }
    navigate(`/meetings/${joinCode}`);
  };

  return (
    <div className="create-meeting-page">
      <div className="create-meeting-container">
        <section className="hero-section">
          <h1 className="hero-title">
            Conéctate, participa y crea juntos ideas que inspiran
          </h1>

          <div className="creation-section">
            <div className="creation-card">
              <h2 className="creation-title">Crear tu propia reunión</h2>

              <button 
                className="create-button primary-button"
                onClick={handleCreateMeeting}
                disabled={loading}
              >
                {loading ? "Creando..." : "Crear reunión"}
              </button>
            </div>

            <div className="divider-vertical"><span>O</span></div>

            <div className="join-section">
              <h2 className="join-title">Unirse a una reunión</h2>

              <div className="join-form">
                <div className="input-group">
                  <label htmlFor="meeting-code" className="input-label">
                    Código de reunión
                  </label>
                  <input
                    id="meeting-code"
                    type="text"
                    placeholder="Ingresa el código"
                    className="code-input"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                  />
                </div>

                <button 
                  className="join-button primary-button"
                  onClick={handleJoin}
                >
                  Ingresar
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}
