import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crmService } from './crmService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)
const mockPost = vi.mocked(apiClient.post)
const mockPatch = vi.mocked(apiClient.patch)

describe('crmService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchAccounts', () => {
    it('searches accounts with query params', async () => {
      const response = { accounts: [], total: 0 }
      mockGet.mockResolvedValue({ data: response })

      const result = await crmService.searchAccounts({ name: 'Test' })

      expect(mockGet).toHaveBeenCalledWith('/crm/search/accounts', { params: { name: 'Test' } })
      expect(result).toEqual(response)
    })
  })

  describe('createAccountCustomer', () => {
    it('creates account customer', async () => {
      const payload = { email: 'test@example.com', password: 'secret' }
      const response = { success: true, customerId: 'cust-1' }
      mockPost.mockResolvedValue({ data: response })

      const result = await crmService.createAccountCustomer(payload as unknown as Parameters<typeof crmService.createAccountCustomer>[0])

      expect(mockPost).toHaveBeenCalledWith('/crm/store/account/customer', payload)
      expect(result).toEqual(response)
    })
  })

  describe('getAccountCustomer', () => {
    it('fetches current account customer', async () => {
      const response = {
        detail: { firstname: 'John', lastname: 'Doe' },
        customer: { address: [{ streetNo: '1', streetName: 'Main St' }] },
      }
      mockGet.mockResolvedValue({ data: response })

      const result = await crmService.getAccountCustomer()

      expect(mockGet).toHaveBeenCalledWith('/crm/account/customer')
      expect(result).toEqual(response)
    })
  })

  describe('updateCustomer', () => {
    it('patches customer updates', async () => {
      const payload = { firstname: 'Jane', lastname: 'Doe' }
      mockPatch.mockResolvedValue({ data: undefined })

      await crmService.updateCustomer(payload as unknown as Parameters<typeof crmService.updateCustomer>[0])

      expect(mockPatch).toHaveBeenCalledWith('/crm/update/customer', payload)
    })
  })
})
