import { apiClient } from '../../../config/api'
import type { User } from '../../../types'

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/user')
    return response.data
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put('/user', userData)
    return response.data
  },
}
