import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './contexts/AuthContext'

/**
 * Main application component
 * @returns {JSX.Element} The root application component
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

