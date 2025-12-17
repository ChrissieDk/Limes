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
  description?: string
  price: number
  brand: string
  displayOrder: number
  isAdHoc: boolean
  // Extended fields added during package selection flow
  productId?: string  // Alternative field name for id (used in navigation state)
  simPackageProductId?: string  // SIM package ID (7029225P, 7023225P, etc.)
  packageType?: 'contract' | 'prepaid'  // Package type
  simStatus?: 'has-sim' | 'needs-sim'  // Whether user has SIM or needs delivery
  planChargeType?: 'once-off' | 'monthly'  // Charge frequency
  features?: {
    mobileData?: string
  }
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


