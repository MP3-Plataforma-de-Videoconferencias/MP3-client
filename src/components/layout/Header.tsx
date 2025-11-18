import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import TeamCall from '../../assets/teamcall.png'
import "../../styles/header.scss"

/**
 * Header component with navigation menu
 * @returns {JSX.Element} Header component
 */
export function Header(): JSX.Element {
  return (
    <header className="navbar">
      <nav className="navbar__logo">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xl font-semibold">
          <img
            src={TeamCall}
            alt="TeamCall Logo"
            className="w-50 h-50 sm:w-50 sm:h-10 object-contain"
          />
        </Link>
      </nav>
      {/* Falta cambiar que solo se muestre cuando hay una sesión iniciada */}
      <button className="navbar__account" aria-label="Mi cuenta">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="navbar__icon">
          <circle cx="12" cy="7.5" r="3.2" />
          <path d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
        </svg>
        <span>Mi cuenta</span>
      </button>
    </header>
  )
}