/**
 * Create meeting page component (placeholder)
 * @returns {JSX.Element} Placeholder component
 */

import "../styles/CreateMeetingPage.scss";

export function CreateMeetingPage(): JSX.Element {
  return (

    <div className="create-meeting-page">
      <div className="create-meeting-container">
        {/* Sección principal */}
        <section className="hero-section">
          <h1 className="hero-title">
            Conéctate, participa y crea juntos ideas que inspiran
          </h1>

          <div className="creation-section">
            <div className="creation-card">
              <h2 className="creation-title">Crear tu propia reunión</h2>

              <button className="create-button primary-button">
                Crear reunión
              </button>
            </div>
            
            <div className="divider-vertical" style={{color: 'black'}}>
              <span>O</span>
            </div>

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
                  />
                </div>

              

                <button className="join-button primary-button">
                  Ingresar
                </button>
              </div>
            </div>
          </div>
        </section>

        
      </div>
    </div>
  );
};
