/**
 * User interface
 */
export interface User {
  id: string
  firstName: string
  lastName: string
  age: number
  email: string
  password?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * User registration data
 */
export interface RegisterData {
  firstName: string
  lastName: string
  age: number
  email: string
  password: string
}

/**
 * User login data
 */
export interface LoginData {
  email: string
  password: string
}

/**
 * User update data
 */
export interface UpdateUserData {
  firstName?: string
  lastName?: string
  age?: number
  email?: string
  password?: string
}

/**
 * Meeting interface
 */
export interface Meeting {
  id: string
  title: string
  description?: string
  hostId: string
  startTime: string
  endTime?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Meeting creation data
 */
export interface CreateMeetingData {
  title: string
  description?: string
  startTime: string
  endTime?: string
}

/**
 * Authentication provider type
 */
export type AuthProvider = 'manual' | 'google' | 'facebook'

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

/**
 * Response from /meetings/create
 */
export interface CreatedMeetingResponse {
  ok: boolean;
  meetingId: string;
  createdAt: string;
  message: string;
}
