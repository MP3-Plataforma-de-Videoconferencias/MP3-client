import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

/**
 * Home page component
 * Displays the main landing page with sitemap
 * @returns {JSX.Element} Home page component
 */
export function HomePage(): JSX.Element {
  return (
    <div className="page-shell page-shell--wide flex justify-center">
      <section className="bubble-panel max-w-4xl w-full text-center">
        <div className="landing-card">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5a7b79]">TeamCall</p>
          <h1>Únete, colabora y comparte desde cualquier lugar</h1>
          <p className="text-base">
            Inicia sesión o regístrate para empezar tu videollamada y mantén tu equipo conectado sin importar la distancia.
          </p>
          <div className="cta-group justify-center">
            <Link className="cta-button cta-button--primary" to={ROUTES.LOGIN}>
              Iniciar sesión
            </Link>
            <Link className="cta-button cta-button--secondary" to={ROUTES.REGISTER}>
              Registrarse
            </Link>
          </div>
        </div>

      </section>
    </div>
  )
}

