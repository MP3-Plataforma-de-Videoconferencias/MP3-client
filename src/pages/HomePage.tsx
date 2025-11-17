import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

export function HomePage(): JSX.Element {
  return (
    <div className="page-shell page-shell--wide flex justify-center">
      <section className="bubble-panel max-w-4xl w-full h-[520px] text-center relative overflow-hidden rounded-2xl">
        <span className="absolute w-[260px] h-[260px] top-[-60px] right-[-80px] rounded-full bg-[rgba(188,222,219,0.6)] z-0 shadow-[0_8px_32px_rgba(108,166,163,0.3)]"></span>
        <span className="absolute w-[140px] h-[140px] bottom-[-10px] left-[-20px] rounded-full bg-[rgba(108,166,163,0.25)] z-0 shadow-[0_8px_24px_rgba(108,166,163,0.25)]"></span>

        <div className="absolute inset-0 flex items-center justify-center">
          
      <div className="landing-card flex flex-col items-center text-center space-y-6 p-8 sm:p-12 rounded-2xl bg-[var(--color-brand-lighter)] border border-[rgba(31,60,58,0.05)] relative z-10 shadow-[0_10px_40px_rgba(31,60,58,0.08),0_2px_8px_rgba(31,60,58,0.06)]">
            <p className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[var(--color-brand-light)] leading-relaxed">
              TeamCall
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-[var(--color-brand)]">
              Únete, colabora y comparte desde cualquier lugar
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-xl leading-relaxed">
              Inicia sesión o regístrate para empezar tu videollamada y mantén tu equipo conectado sin importar la distancia.
            </p>

            <div className="cta-group flex flex-col sm:flex-row gap-4 mt-4 justify-center w-full">
              <Link className="cta-button cta-button--primary" to={ROUTES.LOGIN}>
                Iniciar sesión
              </Link>
              <Link className="cta-button cta-button--secondary" to={ROUTES.REGISTER}>
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
