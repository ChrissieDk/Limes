import { apiClient } from '../../../config/api'
import type { CatalogCategoryTree, CatalogCategoryId, CatalogProductsResponse, SearchCategoryProductsQuery } from '../../../types'

export interface GetCategoryTreeParams {
  groupCode?: string | number
  groupOnly?: boolean
}

export const catalogService = {
  async getCategoryTree(params?: GetCategoryTreeParams): Promise<CatalogCategoryTree> {
    const response = await apiClient.get('/catalog/category/tree', { params })
    return response.data
  },
  async getCategoryById<T = CatalogProductsResponse>(categoryId: CatalogCategoryId): Promise<T> {
    const response = await apiClient.get(`/catalog/category/${categoryId}`)
    return response.data
  },
  async searchCategoryProducts(category: string, params?: SearchCategoryProductsQuery): Promise<CatalogProductsResponse> {
    const response = await apiClient.get(`/catalog/products/category/${category}`, { params })
    return response.data
  },
  async getProductById(productId: string): Promise<any> {
    const response = await apiClient.get(`/catalog/products/${productId}`)
    return response.data
  },
}


