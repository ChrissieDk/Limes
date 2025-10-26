export interface CatalogCategoryNode {
  id: string
  name: string
  displayOrder: number
  children: CatalogCategoryNode[]
  productCount: number
  hasProducts: boolean
}

export type CatalogCategoryTree = CatalogCategoryNode[]

export type CatalogCategoryId = CatalogCategoryNode['id']

export interface CatalogProduct {
  id: string
  sku: string
  name: string
  description: string
  price: number
  brand: string
  displayOrder: number
  isAdHoc: boolean
}

export interface PaginatedCatalogResponse<T> {
  data: T[]
  page: number
  limit: number
  items: number
  totalPages: number
  totalItems: number
  isLastPage: boolean
  isFirstPage: boolean
}

export type CatalogProductsResponse = PaginatedCatalogResponse<CatalogProduct>

export interface SearchCategoryProductsQuery {
  page?: number
  limit?: number
}


