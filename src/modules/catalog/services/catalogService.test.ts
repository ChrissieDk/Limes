import { describe, it, expect, vi, beforeEach } from 'vitest'
import { catalogService } from './catalogService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)

describe('catalogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCategoryTree', () => {
    it('fetches category tree with default params', async () => {
      const tree = [{ id: 'channels', name: 'Channels', children: [] }]
      mockGet.mockResolvedValue({ data: tree })

      const result = await catalogService.getCategoryTree()

      expect(mockGet).toHaveBeenCalledWith('/catalog/category/tree', { params: undefined })
      expect(result).toEqual(tree)
    })

    it('fetches category tree with custom params', async () => {
      const tree = [{ id: 'channels', name: 'Channels', children: [] }]
      mockGet.mockResolvedValue({ data: tree })

      const result = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })

      expect(mockGet).toHaveBeenCalledWith('/catalog/category/tree', { params: { groupCode: 123, groupOnly: true } })
      expect(result).toEqual(tree)
    })
  })

  describe('getCategoryById', () => {
    it('fetches category by id', async () => {
      const category = { id: 'cat-1', name: 'Test', products: [] }
      mockGet.mockResolvedValue({ data: category })

      const result = await catalogService.getCategoryById('cat-1')

      expect(mockGet).toHaveBeenCalledWith('/catalog/category/cat-1')
      expect(result).toEqual(category)
    })
  })

  describe('searchCategoryProducts', () => {
    it('searches products in a category with query params', async () => {
      const response = { data: [{ id: 'p1', name: 'Product 1' }], meta: { total: 1 } }
      mockGet.mockResolvedValue({ data: response })

      const result = await catalogService.searchCategoryProducts('m2m_combo', { page: 1, limit: 100 })

      expect(mockGet).toHaveBeenCalledWith('/catalog/products/category/m2m_combo', { params: { page: 1, limit: 100 } })
      expect(result).toEqual(response)
    })
  })

  describe('getProductById', () => {
    it('fetches product by id', async () => {
      const product = { id: 'p1', name: 'Product 1', price: 100 }
      mockGet.mockResolvedValue({ data: product })

      const result = await catalogService.getProductById('p1')

      expect(mockGet).toHaveBeenCalledWith('/catalog/products/p1')
      expect(result).toEqual(product)
    })
  })
})
