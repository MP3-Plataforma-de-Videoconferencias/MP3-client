import type { ApiResponse } from '@types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * API service for making HTTP requests
 */
class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  /**
   * Makes a GET request
   * @param endpoint - API endpoint
   * @param options - Fetch options
   * @returns Promise with API response
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * Makes a POST request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Fetch options
   * @returns Promise with API response
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  }

  /**
   * Makes a PUT request
   * @param endpoint - API endpoint
   * @param data - Request body data
   * @param options - Fetch options
   * @returns Promise with API response
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
  }

  /**
   * Makes a DELETE request
   * @param endpoint - API endpoint
   * @param options - Fetch options
   * @returns Promise with API response
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  /**
   * Base request method
   * @param endpoint - API endpoint
   * @param options - Fetch options
   * @returns Promise with API response
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || data.message || 'An error occurred',
          message: data.message,
        }
      }

      return { data: data as T }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error occurred',
      }
    }
  }

  /**
   * Gets authentication headers
   * @returns Headers object with auth token if available
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

export const apiService = new ApiService(API_BASE_URL)

