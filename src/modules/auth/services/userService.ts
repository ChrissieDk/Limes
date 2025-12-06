import { apiClient } from '../../../config/api'
import type { User, CreateUserRequest, CreateUserResponse } from '../../../types'

export const userService = {
  // User: Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/user')
    return response.data
  },

  // User: Update user
  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put('/user', userData)
    return response.data
  },

  // User: Register user
  async registerUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post('/user/register', payload)
    return response.data
  },
}
