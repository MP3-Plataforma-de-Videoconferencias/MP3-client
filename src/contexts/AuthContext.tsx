import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, AuthProvider } from '@/types'
import { userService } from '@services/userService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithProvider: (provider: AuthProvider) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Auth context provider component
 * @param children - Child components
 * @returns Auth context provider
 */
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  /**
   * Checks if user is authenticated
   */
  const checkAuth = async (): Promise<void> => {
    const token = localStorage.getItem('authToken')
    if (token) {
      const response = await userService.getProfile()
      if (response.data) {
        setUser(response.data)
      } else {
        localStorage.removeItem('authToken')
      }
    }
    setIsLoading(false)
  }

  /**
   * Logs in user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    const response = await userService.login({ email, password })
    if (response.data) {
      setUser(response.data as User)
    } else {
      throw new Error(response.error || 'Login failed')
    }
  }

  /**
   * Logs in user with OAuth provider
   */
  const loginWithProvider = async (provider: AuthProvider): Promise<void> => {
    // TODO: Implement OAuth login (Google, Facebook)
    throw new Error(`${provider} login not yet implemented`)
  }

  /**
   * Logs out user
   */
  const logout = (): void => {
    userService.logout()
    setUser(null)
  }

  /**
   * Updates user data
   */
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    const response = await userService.updateProfile(userData)
    if (response.data) {
      setUser(response.data)
    } else {
      throw new Error(response.error || 'Update failed')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithProvider,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to use auth context
 * @returns Auth context value
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

