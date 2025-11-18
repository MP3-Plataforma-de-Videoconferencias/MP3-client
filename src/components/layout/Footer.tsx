import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import TeamCall from '../../assets/teamcall.png'

/**
 * Footer component with sitemap
 * @returns {JSX.Element} 
 */
export function Footer(): JSX.Element {
  const { pathname } = useLocation()

  // Hide the site footer only for meeting rooms (e.g. `/meetings/:id`).
  // Keep it visible on `/meetings` or `/meetings/create`.
  const isMeetingRoom = pathname.startsWith('/meetings/') && !pathname.startsWith('/meetings/create')
  if (isMeetingRoom) return <></>
  return (
    <footer className="site-footer mt-auto bg-[#a9c7c7] text-[#1f3c3a]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between">
        
        <div className="flex flex-col items-center sm:items-start">
          <img
            src={TeamCall}
            alt="TeamCall Logo"
            className="w-50 h-50 sm:w-50 sm:h-10 object-contain"
          />
          <span className="text-center sm:text-left text-sm sm:text-base text-[#395b59] leading-tight max-w-xs mt-1">
            Crea tus videollamadas y reúnete con quien quieras, desde cualquier lugar.
          </span>
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