import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from './userService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)
const mockPut = vi.mocked(apiClient.put)
const mockPatch = vi.mocked(apiClient.patch)
const mockPost = vi.mocked(apiClient.post)

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCurrentUser', () => {
    it('fetches current user', async () => {
      const user = { id: '1', emailAddress: 'test@example.com', msisdns: ['27612345678'] }
      mockGet.mockResolvedValue({ data: user })

      const result = await userService.getCurrentUser()

      expect(mockGet).toHaveBeenCalledWith('/user')
      expect(result).toEqual(user)
    })
  })

  describe('updateUser', () => {
    it('updates user data', async () => {
      const userData = { displayName: 'New Name' }
      const updated = { id: '1', displayName: 'New Name' }
      mockPut.mockResolvedValue({ data: updated })

      const result = await userService.updateUser(userData)

      expect(mockPut).toHaveBeenCalledWith('/user', userData)
      expect(result).toEqual(updated)
    })
  })

  describe('updateSimDescription', () => {
    it('patches sim description', async () => {
      const payload = { msisdn: '27612345678', simDescription: 'My SIM' }
      mockPatch.mockResolvedValue({ data: undefined })

      await userService.updateSimDescription(payload)

      expect(mockPatch).toHaveBeenCalledWith('/user/sim-description', payload)
    })
  })

  describe('registerUser', () => {
    it('registers a new user', async () => {
      const payload = { email: 'test@example.com', password: 'secret', firstName: 'John', lastName: 'Doe' }
      const response = { success: true, userId: '1' }
      mockPost.mockResolvedValue({ data: response })

      const result = await userService.registerUser(payload as unknown as Parameters<typeof userService.registerUser>[0])

      expect(mockPost).toHaveBeenCalledWith('/user/register', payload)
      expect(result).toEqual(response)
    })
  })

  describe('hasAccount', () => {
    it('returns boolean directly when response is boolean', async () => {
      mockGet.mockResolvedValue({ data: true })

      const result = await userService.hasAccount()

      expect(mockGet).toHaveBeenCalledWith('/user/has-account')
      expect(result).toBe(true)
    })

    it('extracts hasPayload from object response', async () => {
      mockGet.mockResolvedValue({ data: { hasPayload: true } })

      const result = await userService.hasAccount()

      expect(result).toBe(true)
    })

    it('extracts hasAccount from object response', async () => {
      mockGet.mockResolvedValue({ data: { hasAccount: true } })

      const result = await userService.hasAccount()

      expect(result).toBe(true)
    })

    it('extracts value from object response', async () => {
      mockGet.mockResolvedValue({ data: { value: true } })

      const result = await userService.hasAccount()

      expect(result).toBe(true)
    })

    it('returns false for unrecognized response shape', async () => {
      mockGet.mockResolvedValue({ data: { somethingElse: true } })

      const result = await userService.hasAccount()

      expect(result).toBe(false)
    })

    it('returns false for null response', async () => {
      mockGet.mockResolvedValue({ data: null })

      const result = await userService.hasAccount()

      expect(result).toBe(false)
    })
  })
})
