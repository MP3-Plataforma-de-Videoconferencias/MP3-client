/**
 * About page component
 * Displays information about the platform
 * @returns {JSX.Element} About page component
 */
import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

/**
 * About page component
 * Displays information about the platform
 * @returns {JSX.Element} About page component
 */
export function AboutPage(): JSX.Element {
  return (
    <div className="page-shell">
      <section className="bubble-panel space-y-8">
        <Link className="back-link" to={ROUTES.HOME}>
          ← Volver
        </Link>
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5a7b79]">Quiénes somos</p>
          <h1 className="page-heading">Acerca de nosotros</h1>
          <p className="text-lg text-[#4e6a69] max-w-2xl mx-auto">
            TeamCall nace para conectar equipos, estudiantes y comunidades mediante experiencias de videollamadas claras,
            seguras y accesibles. Diseñamos la plataforma pensando en personas reales que necesitan colaborar sin
            interrupciones.
          </p>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <h3>Propósito</h3>
            <p>
              Simplificar la comunicación remota con una interfaz amable, accesible y consistente, lista para cualquier
              dispositivo.
            </p>
          </article>
          <article className="info-card">
            <h3>Visión</h3>
            <p>
              Ser la plataforma donde cada reunión se siente cercana: video fluido, chat en tiempo real y herramientas
              intuitivas para trabajar mejor en equipo.
            </p>
          </article>
          <article className="info-card">
            <h3>Valores</h3>
            <ul>
              <li>Conexiones humanas primero</li>
              <li>Diseño accesible y responsivo</li>
              <li>Seguridad y confianza en cada reunión</li>
            </ul>
          </article>
        </div>

      </section>
    </div>
  )
}

