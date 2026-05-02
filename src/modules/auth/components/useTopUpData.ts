import { useEffect, useState, useCallback } from 'react'
import { catalogService } from '../../catalog/services/catalogService'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'

export interface TopUpData {
  bundleCategories: CatalogCategoryNode[]
  selectedCategory: string | null
  products: CatalogProduct[]
  selectedProduct: CatalogProduct | null
  loading: boolean
  error: string | null
  setSelectedCategory: (id: string | null) => void
  setSelectedProduct: (p: CatalogProduct | null) => void
  handleBackToCategories: () => void
}

export function useTopUpData(open: boolean, kind: 'airtime' | 'bundles'): TopUpData {
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch bundle categories when modal opens and bundles tab is active
  useEffect(() => {
    if (!open || kind !== 'bundles') return

    const fetchBundleCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })

        const channel = tree.find((node) => node.id === 'channels')
        if (!channel) {
          setError('Channel category not found')
          console.error('[TopUp] Channel node not found in tree')
          return
        }

        const onceOffTopUp = channel.children?.find((node) => node.id === 'once_off_top_up')
        if (!onceOffTopUp) {
          setError('Top-up category not found')
          console.error('[TopUp] once_off_top_up node not found under channel')
          return
        }

        if (onceOffTopUp.children && onceOffTopUp.children.length > 0) {
          const filteredCategories = onceOffTopUp.children.filter(
            (category) =>
              !category.name?.toUpperCase().includes('FWA') &&
              !category.id?.toUpperCase().includes('FWA') &&
              !category.name?.toUpperCase().includes('AIRTIME') &&
              !category.id?.toUpperCase().includes('AIRTIME')
          )
          setBundleCategories(filteredCategories)
        } else {
          setError('No bundle categories found')
          console.error('[TopUp] No children found under once_off_top_up')
        }
      } catch (err) {
        setError('Failed to load bundle categories')
        console.error('Error fetching bundle categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBundleCategories()
  }, [open, kind])

  // Fetch products when category is selected
  useEffect(() => {
    if (!selectedCategory) return

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await catalogService.searchCategoryProducts(selectedCategory, {
          page: 1,
          limit: 100,
        })

        const filteredProducts = response.data.filter(
          (product) =>
            !product.name?.toUpperCase().includes('FWA') &&
            !product.description?.toUpperCase().includes('FWA')
        )

        setProducts(filteredProducts)
      } catch (err) {
        setError('Failed to load products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null)
    setSelectedProduct(null)
    setProducts([])
  }, [])

  return {
    bundleCategories,
    selectedCategory,
    products,
    selectedProduct,
    loading,
    error,
    setSelectedCategory,
    setSelectedProduct,
    handleBackToCategories,
  }
}
