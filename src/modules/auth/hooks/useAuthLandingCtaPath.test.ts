import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useAuthLandingCtaPath } from './useAuthLandingCtaPath'

type AuthUser = { uid: string }
type AuthStateCallback = (user: AuthUser | null) => void

const mockOnAuthStateChanged = vi.fn()

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (...args: [unknown, AuthStateCallback]) => mockOnAuthStateChanged(...args),
}))

vi.mock('../../../config/firebase', () => ({
  auth: { currentUser: null },
}))

describe('useAuthLandingCtaPath', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockOnAuthStateChanged.mockReturnValue(vi.fn())
  })

  it('starts with the requested guest path', () => {
    const { result } = renderHook(() => useAuthLandingCtaPath('/signup'))

    expect(result.current).toBe('/signup')
  })

  it('switches to dashboard packages when authentication resolves', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, callback: AuthStateCallback) => {
      callback({ uid: 'user-1' })
      return vi.fn()
    })

    const { result } = renderHook(() => useAuthLandingCtaPath('/signin'))

    await waitFor(() => {
      expect(result.current).toBe('/dashboard/packages')
    })
  })

  it('switches back to the guest path after sign-out', async () => {
    let callback: AuthStateCallback | undefined
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, next: AuthStateCallback) => {
      callback = next
      return vi.fn()
    })

    const { result } = renderHook(() => useAuthLandingCtaPath('/signin'))

    act(() => callback?.({ uid: 'user-1' }))
    await waitFor(() => expect(result.current).toBe('/dashboard/packages'))

    act(() => callback?.(null))
    await waitFor(() => expect(result.current).toBe('/signin'))
  })
})
