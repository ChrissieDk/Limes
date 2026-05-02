import { apiClient } from '../../../config/api'
import type { User, CreateUserRequest, CreateUserResponse } from '../../../types'

export const userService = {
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/user')
    return response.data
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put('/user', userData)
    return response.data
  },

  async updateSimDescription(payload: { msisdn: string; simDescription: string }): Promise<void> {
    await apiClient.patch('/user/sim-description', payload)
  },

  async registerUser(payload: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await apiClient.post('/user/register', payload)
    return response.data
  },

  async hasAccount(): Promise<boolean> {
    const response = await apiClient.get('/user/has-account')
    const data: unknown = response.data

    if (typeof data === 'boolean') {
      return data
    }

    if (data && typeof data === 'object') {
      const shaped = data as { hasPayload?: unknown; hasAccount?: unknown; value?: unknown }

      if (typeof shaped.hasPayload === 'boolean') {
        return shaped.hasPayload
      }

      if (typeof shaped.hasAccount === 'boolean') {
        return shaped.hasAccount
      }

      if (typeof shaped.value === 'boolean') {
        return shaped.value
      }
    }

    return false
  },
}
