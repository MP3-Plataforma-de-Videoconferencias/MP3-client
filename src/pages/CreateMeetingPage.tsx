import "../styles/CreateMeetingPage.scss";
import { meetingService } from "@/services/meetingService";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { generateMeetingCode } from "@/utils/meeting";
import { getUserDisplayName } from "@/utils/auth";

export function CreateMeetingPage(): JSX.Element {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateMeeting = async () => {
    const generatedCode = generateMeetingCode();

    const email = getUserDisplayName() || "unknown_user";

    const meetingPayload = {
      title: `Reunión ${generatedCode}`,
      startTime: new Date().toISOString(),
      roomCode: generatedCode,
      createdBy: email,
    };

    try {
      setLoading(true);

      const response = await meetingService.create(meetingPayload);

      const serverMeetingId = response.data?.meetingId;
      if (serverMeetingId && serverMeetingId !== generatedCode) {
        navigate(`/meetings/${serverMeetingId}`);
      } else {
        navigate(`/meetings/${generatedCode}`);
      }
    } catch (error) {
      console.error(error);
      // En caso de error con el servidor, aún podemos usar el código generado localmente
      navigate(`/meetings/${generatedCode}`);
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
    <div className="create-meeting-page" aria-label="Página para crear o unirse a reuniones">
      <div className="create-meeting-container" aria-label="Contenedor principal">
        <section className="hero-section" aria-label="Sección principal">
          <h1
            className="hero-title"
            aria-label="Conéctate, participa y crea juntos ideas que inspiran"
          >
            Conéctate, participa y crea juntos ideas que inspiran
          </h1>

          <div className="creation-section" aria-label="Sección para crear reuniones">
            <div className="creation-card" aria-label="Tarjeta para crear reuniones">
              <h2 className="creation-title" aria-label="Título para crear reuniones">
                Crear tu propia reunión
              </h2>

              <button
                className="create-button primary-button"
                onClick={handleCreateMeeting}
                disabled={loading}
                aria-label="Botón para crear reunión"
              >
                {loading ? "Creando..." : "Crear reunión"}
              </button>
            </div>

            <div className="divider-vertical" aria-label="Divisor entre secciones">
              <span>O</span>
            </div>

            <div className="join-section" aria-label="Sección para unirse a reuniones">
              <h2 className="join-title" aria-label="Título para unirse a reuniones">
                Unirse a una reunión
              </h2>

              <div className="join-form" aria-label="Formulario para unirse a reuniones">
                <div className="input-group" aria-label="Grupo de entrada para código de reunión">
                  <label
                    htmlFor="meeting-code"
                    className="input-label"
                    aria-label="Etiqueta para código de reunión"
                  >
                    Código de reunión
                  </label>
                  <input
                    id="meeting-code"
                    type="text"
                    placeholder="Ingresa el código"
                    className="code-input"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    aria-label="Entrada para código de reunión"
                  />
                </div>

                <button
                  className="join-button primary-button"
                  onClick={handleJoin}
                  aria-label="Botón para unirse a reunión"
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
