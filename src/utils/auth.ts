import { jwtDecode } from 'jwt-decode'

/**
 * JWT Payload interface
 */
interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

/**
 * Gets the current user ID from the stored token
 * @returns User ID or null if token is not available or invalid
 */
export function getUserIdFromToken(): string | null {
  try {
    // Intentar obtener el token de ambas ubicaciones posibles
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')
    
    if (!token) {
      return null
    }

    const decoded = jwtDecode<JWTPayload>(token)
    return decoded.userId || null
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Gets the current user's display name from token or user data
 * @returns User display name or null
 */
export function getUserDisplayName(): string | null {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken')
    
    if (!token) {
      return null
    }

    const decoded = jwtDecode<JWTPayload>(token)
    // Si el token tiene información del nombre, usarla
    // Por ahora retornamos el email como fallback
    return decoded.email || null
  } catch (error) {
    console.error('Error getting user display name:', error)
    return null
  }
}

