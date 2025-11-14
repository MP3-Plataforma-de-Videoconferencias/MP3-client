import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

/**
 * Main layout component
 * Wraps all pages with header and footer
 * @returns {JSX.Element} Layout component
 */
export function MainLayout(): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

