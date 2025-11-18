import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@utils/constants'
import { useAuth } from '@contexts/AuthContext'

/**
 * Site map page component
 * Displays a full list of navigation links
 * @returns {JSX.Element} Site map page component
 */
export function SiteMapPage(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  function handleCreateClick(): void {
    if (isLoading) return
    if (isAuthenticated) navigate(ROUTES.CREATE_MEETING)
    else navigate(ROUTES.LOGIN, { state: { from: ROUTES.CREATE_MEETING } })
  }
  const mapSections = [
    {
      title: 'Navegación principal',
      description: 'Secciones públicas del sitio',
      links: [
        { label: 'Landing Page', to: ROUTES.HOME },
        { label: 'Acerca de nosotros', to: ROUTES.ABOUT },
        { label: 'Mapa del sitio', to: ROUTES.SITE_MAP },
      ],
    },
    {
      title: 'Accesos rápidos',
      description: 'Acciones enfocadas en el usuario',
      links: [
        { label: 'Iniciar sesión', to: ROUTES.LOGIN },
        { label: 'Registrarse', to: ROUTES.REGISTER },
      ],
    },
    {
      title: 'Interacción con reuniones',
      description: 'Requiere iniciar sesión',
      links: [
        { label: 'Crear una reunión', to: ROUTES.CREATE_MEETING },
        { label: 'Unirse a una reunión', to: ROUTES.CREATE_MEETING },
        
      ],
    },
  ]

  return (
    <div className="page-shell page-shell--wide" >
      <section className="bubble-panel space-y-6">
        <Link className="back-link" to={ROUTES.HOME}>
          ←
        </Link>
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5a7b79]">Navegación guiada</p>
          <h1 className="page-heading">Mapa del sitio</h1>
          <p className="text-[#4e6a69]">
            Una vista clara de las secciones disponibles para que encuentres lo que necesitas en segundos.
          </p>
        </div>
        <div className="site-map-cards">
          {mapSections.map((section) => (
            <article key={section.title} className="site-map-card">
              <div className="site-map-badge">{section.title}</div>
              <p className="text-sm text-[#4e6a69] mb-3">{section.description}</p>
              <ul className="space-y-2 text-lg font-semibold">
                {section.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="underline decoration-[#bcdedb] decoration-2 underline-offset-4">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

