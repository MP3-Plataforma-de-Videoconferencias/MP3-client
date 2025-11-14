import { Link } from 'react-router-dom'
import { ROUTES } from '@utils/constants'

/**
 * Header component with navigation menu
 * @returns {JSX.Element} Header component
 */
export function Header(): JSX.Element {
  return (
    <header className="border-b border-[#9fbcba] bg-[#cfe6e3]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl px-4 py-4 text-[#1f3c3a]">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xl font-semibold">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg">
            TC
          </span>
          TeamCall
        </Link>
      </nav>
    </header>
  )
}

