import { apiService } from './api'
import type { User, RegisterData, LoginData, UpdateUserData, ApiResponse } from '@/types'

/**
 * User service for user-related API operations
 */
export const userService = {
  /**
   * Registers a new user
   * @param data - User registration data
   * @returns Promise with user data or error
   */
  async register(data: RegisterData): Promise<ApiResponse<User>> {
    return apiService.post<User>('/users/register', data)
  },

  /**
   * Logs in a user
   * @param data - User login credentials
   * @returns Promise with user data or error
   */
  async login(data: LoginData): Promise<ApiResponse<User>> {
    const response = await apiService.post<{ user: User; token: string }>('/users/login', data)
    if (response.error) {
      return { error: response.error }
    }

    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token)
    }

    return {
      data: response.data?.user  
    }
  },

  /**
   * Gets current user profile
   * @returns Promise with user data or error
   */
  async getProfile(): Promise<ApiResponse<User>> {
    return apiService.get<User>('/users/profile')
  },

  /**
   * Updates user profile
   * @param data - User data to update
   * @returns Promise with updated user data or error
   */
  async updateProfile(data: UpdateUserData): Promise<ApiResponse<User>> {
    return apiService.put<User>('/users/profile', data)
  },

  /**
   * Deletes user account
   * @returns Promise with success or error
   */
  async deleteAccount(): Promise<ApiResponse<void>> {
    return apiService.delete<void>('/users/profile')
  },

  /**
   * Requests password recovery
   * @param email - User email
   * @returns Promise with success or error
   */
  async recoverPassword(email: string): Promise<ApiResponse<void>> {
    return apiService.post<void>('/users/recover-password', { email })
  },

  /**
   * Logs out the current user
   */
  logout(): void {
    localStorage.removeItem('authToken')
  },
}

