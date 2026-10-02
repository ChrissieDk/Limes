import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type AxiosError } from 'axios'
import { inventoryService, type SimCheckOutcome } from './inventoryService'

vi.mock('../../../config/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '../../../config/api'

const mockGet = vi.mocked(apiClient.get)

describe('inventoryService.checkSim', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('returns AVAILABLE when status is AVAILABLE', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'AVAILABLE', isAvailable: true, iccid: '123', simType: 'test', imsi: '111' },
    })
    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(true)
    expect((result as Extract<SimCheckOutcome, { ok: true }>).status).toBe('AVAILABLE')
  })

  it('returns RESERVED when status is RESERVED', async () => {
    mockGet.mockResolvedValue({
      data: { status: 'RESERVED', isAvailable: false, iccid: '123', simType: 'test', imsi: '111' },
    })
    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('RESERVED')
    expect((result as Exclude<SimCheckOutcome, { ok: true }>).message).toContain('already been activated')
  })

  it('returns NOT_FOUND on 404', async () => {
    const err = new Error('Not Found') as AxiosError
    err.isAxiosError = true
    Object.assign(err, { response: { status: 404 } })
    mockGet.mockRejectedValue(err)

    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('NOT_FOUND')
    expect((result as Exclude<SimCheckOutcome, { ok: true }>).message).toContain("couldn't find this ICCID")
  })

  it('returns NETWORK_ERROR when no response', async () => {
    const err = new Error('Network Error') as AxiosError
    err.isAxiosError = true
    Object.assign(err, { response: undefined })
    mockGet.mockRejectedValue(err)

    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('NETWORK_ERROR')
    expect((result as Exclude<SimCheckOutcome, { ok: true }>).message).toContain("couldn't reach")
  })

  it('returns SERVER_ERROR on 500', async () => {
    const err = new Error('Server Error') as AxiosError
    err.isAxiosError = true
    Object.assign(err, { response: { status: 500 } })
    mockGet.mockRejectedValue(err)

    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('SERVER_ERROR')
    expect((result as Exclude<SimCheckOutcome, { ok: true }>).message).toContain('technical issue')
  })

  it('returns NOT_FOUND for empty string', async () => {
    const result = await inventoryService.checkSim('   ')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('NOT_FOUND')
  })

  it('returns INVALID_RESPONSE for malformed data', async () => {
    mockGet.mockResolvedValue({ data: { foo: 'bar' } })
    const result = await inventoryService.checkSim('8927078220008762165')
    expect(result.ok).toBe(false)
    expect(result.status).toBe('INVALID_RESPONSE')
  })
})
