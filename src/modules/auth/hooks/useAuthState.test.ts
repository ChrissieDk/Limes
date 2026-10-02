import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuthState } from './useAuthState'

const mockUnsubscribe = vi.fn()
const mockOnAuthStateChanged = vi.fn()
type AuthStateCallback = (user: { uid: string; email?: string } | null) => void

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: [unknown, AuthStateCallback]) => mockOnAuthStateChanged(...args),
}))

vi.mock('../../../config/firebase', () => ({
  auth: { currentUser: null },
}))

describe('useAuthState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ready=false initially', () => {
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() => useAuthState())

    expect(result.current.ready).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('sets ready=true and user when auth state resolves', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' }
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(mockUser)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useAuthState())

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
      expect(result.current.user).toEqual(mockUser)
    })
  })

  it('sets ready=true and null user when not authenticated', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
      callback(null)
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useAuthState())

    await waitFor(() => {
      expect(result.current.ready).toBe(true)
      expect(result.current.user).toBeNull()
    })
  })

  it('unsubscribes on unmount', () => {
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() => useAuthState())
    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})
