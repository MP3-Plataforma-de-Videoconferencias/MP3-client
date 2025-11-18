import { apiService } from './api'
import type { Meeting, CreatedMeetingResponse, ApiResponse, CreateMeetingData } from '@/types'


/**
 * Meeting service for meeting-related API operations
 */
export const meetingService = {
  /**
   * Creates a new meeting
   * @param data - Meeting creation data
   * @returns Promise with meeting data or error
   */
  async create(): Promise<ApiResponse<CreatedMeetingResponse>> {
  return apiService.post<CreatedMeetingResponse>('/api/meetings/create')
},


  /**
   * Gets a meeting by ID
   * @param id - Meeting ID
   * @returns Promise with meeting data or error
   */
  async getById(id: string): Promise<ApiResponse<Meeting>> {
    return apiService.get<Meeting>(`/meetings/${id}`)
  },

  /**
   * Gets all meetings for the current user
   * @returns Promise with meetings array or error
   */
  async getAll(): Promise<ApiResponse<Meeting[]>> {
    return apiService.get<Meeting[]>('/meetings')
  },

  /**
   * Updates a meeting
   * @param id - Meeting ID
   * @param data - Meeting data to update
   * @returns Promise with updated meeting data or error
   */
  async update(id: string, data: Partial<CreateMeetingData>): Promise<ApiResponse<Meeting>> {
    return apiService.put<Meeting>(`/meetings/${id}`, data)
  },

  /**
   * Deletes a meeting
   * @param id - Meeting ID
   * @returns Promise with success or error
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/meetings/${id}`)
  },
}

