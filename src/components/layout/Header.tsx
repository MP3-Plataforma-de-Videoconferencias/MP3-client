import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import TeamCall from '../../assets/teamcall.png'

/**
 * Header component with navigation menu
 * @returns {JSX.Element} Header component
 */
export function Header(): JSX.Element {
  return (
    <header className="border-b border-[#9fbcba] bg-[#cfe6e3]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl px-4 py-4 text-[#1f3c3a]">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xl font-semibold">
          <img
            src={TeamCall}
            alt="TeamCall Logo"
            className="w-50 h-50 sm:w-50 sm:h-10 object-contain"
          />
        </Link>
      </nav>
    </header>
  )
}