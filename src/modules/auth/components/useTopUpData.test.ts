import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useTopUpData } from './useTopUpData'

const mockGetCategoryTree = vi.fn()
const mockSearchCategoryProducts = vi.fn()

vi.mock('../../catalog/services/catalogService', () => ({
  catalogService: {
    getCategoryTree: (...args: any[]) => mockGetCategoryTree(...args),
    searchCategoryProducts: (...args: any[]) => mockSearchCategoryProducts(...args),
  },
}))

describe('useTopUpData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createCategoryTree = () => [
    {
      id: 'channels',
      name: 'Channels',
      children: [
        {
          id: 'once_off_top_up',
          name: 'Once-off Top Up',
          children: [
            { id: 'data', name: 'Data Bundles', productCount: 5 },
            { id: 'voice', name: 'Voice Bundles', productCount: 3 },
            { id: 'fwa-data', name: 'FWA Data', productCount: 2 },
          ],
        },
      ],
    },
  ]

  it('does not fetch when modal is closed', () => {
    renderHook(() => useTopUpData(false, 'bundles'))
    expect(mockGetCategoryTree).not.toHaveBeenCalled()
  })

  it('does not fetch when kind is not bundles', () => {
    renderHook(() => useTopUpData(true, 'airtime'))
    expect(mockGetCategoryTree).not.toHaveBeenCalled()
  })

  it('fetches bundle categories when modal opens with bundles kind', async () => {
    mockGetCategoryTree.mockResolvedValue(createCategoryTree())

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetCategoryTree).toHaveBeenCalledWith({ groupCode: 123, groupOnly: true })
    expect(result.current.bundleCategories).toHaveLength(2)
    expect(result.current.bundleCategories[0].name).toBe('Data Bundles')
    expect(result.current.bundleCategories[1].name).toBe('Voice Bundles')
    expect(result.current.error).toBeNull()
  })

  it('sets error when channel node is missing', async () => {
    mockGetCategoryTree.mockResolvedValue([{ id: 'other', name: 'Other', children: [] }])

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Channel category not found')
    expect(result.current.bundleCategories).toHaveLength(0)
  })

  it('sets error when once_off_top_up node is missing', async () => {
    mockGetCategoryTree.mockResolvedValue([
      { id: 'channels', name: 'Channels', children: [{ id: 'other', name: 'Other' }] },
    ])

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Top-up category not found')
  })

  it('sets error when no bundle categories exist', async () => {
    mockGetCategoryTree.mockResolvedValue([
      {
        id: 'channels',
        name: 'Channels',
        children: [{ id: 'once_off_top_up', name: 'Once-off Top Up', children: [] }],
      },
    ])

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('No bundle categories found')
  })

  it('handles fetch error gracefully', async () => {
    mockGetCategoryTree.mockRejectedValue(new Error('Network failed'))

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load bundle categories')
  })

  it('fetches products when category is selected', async () => {
    mockGetCategoryTree.mockResolvedValue(createCategoryTree())
    mockSearchCategoryProducts.mockResolvedValue({
      data: [
        { id: 'p1', name: '1GB Data', price: 50 },
        { id: 'p2', name: '2GB Data', price: 100 },
      ],
      meta: { total: 2 },
    })

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSelectedCategory('data')
    })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockSearchCategoryProducts).toHaveBeenCalledWith('data', { page: 1, limit: 100 })
    expect(result.current.products).toHaveLength(2)
    expect(result.current.products[0].name).toBe('1GB Data')
  })

  it('filters out FWA products', async () => {
    mockGetCategoryTree.mockResolvedValue(createCategoryTree())
    mockSearchCategoryProducts.mockResolvedValue({
      data: [
        { id: 'p1', name: '1GB Data', price: 50 },
        { id: 'p2', name: 'FWA Home Data', price: 200 },
      ],
      meta: { total: 2 },
    })

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSelectedCategory('data')
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toHaveLength(1)
    expect(result.current.products[0].name).toBe('1GB Data')
  })

  it('resets state on handleBackToCategories', async () => {
    mockGetCategoryTree.mockResolvedValue(createCategoryTree())
    mockSearchCategoryProducts.mockResolvedValue({
      data: [{ id: 'p1', name: '1GB Data', price: 50 }],
      meta: { total: 1 },
    })

    const { result } = renderHook(() => useTopUpData(true, 'bundles'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSelectedCategory('data')
    })

    await waitFor(() => {
      expect(result.current.products).toHaveLength(1)
    })

    act(() => {
      result.current.handleBackToCategories()
    })

    expect(result.current.selectedCategory).toBeNull()
    expect(result.current.selectedProduct).toBeNull()
    expect(result.current.products).toHaveLength(0)
  })
})
