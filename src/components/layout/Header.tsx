import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ROUTES } from '@utils/constants'
import TeamCall from '../../assets/teamcall.png'
import "../../styles/header.scss"

/**
 * Header component with navigation menu
 * @returns {JSX.Element} Header component
 */
export function Header(): JSX.Element {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate(ROUTES.LOGIN)
  }

  const handleAccountClick = () => {
    navigate(ROUTES.PROFILE)
  }

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
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          <button 
            className="navbar__account" 
            aria-label="Mi cuenta"
            onClick={handleAccountClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="navbar__icon">
              <circle cx="12" cy="7.5" r="3.2" />
              <path d="M4 19c0-3.314 3.582-6 8-6s8 2.686 8 6v1H4v-1z" />
            </svg>
            <span>Mi cuenta</span>
          </button>
          <button 
            className="navbar__account" 
            aria-label="Cerrar sesión"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="navbar__icon">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </header>
  )
}