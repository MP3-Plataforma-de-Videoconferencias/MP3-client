import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

/**
 * Footer component with sitemap
 * @returns {JSX.Element} Footer component
 */
export function Footer(): JSX.Element {
  return (
    <footer className="mt-auto bg-[#cfe6e3] text-[#1f3c3a]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
              TC
            </span>
            TeamCall
          </div>
          <p className="mt-2 max-w-sm text-sm text-[#395b59]">
            Crea tus videollamadas y reúnete con quien quieras, desde cualquier lugar.
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm font-semibold sm:items-end">
          <Link className="hover:underline" to={ROUTES.HOME}>
            Inicio
          </Link>
          <Link className="hover:underline" to={ROUTES.ABOUT}>
            Acerca de nosotros
          </Link>
          <Link className="hover:underline" to={ROUTES.SITE_MAP}>
            Mapa del sitio
          </Link>
        </div>
      </div>
    </footer>
  )
}

