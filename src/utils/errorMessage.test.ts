import { describe, it, expect } from 'vitest'
import { getAxiosErrorMessage } from './errorMessage'

describe('getAxiosErrorMessage', () => {
  it('extracts message from response.data.message', () => {
    const err = { response: { data: { message: 'Server down' } } }
    expect(getAxiosErrorMessage(err)).toBe('Server down')
  })

  it('extracts message from response.data.error', () => {
    const err = { response: { data: { error: 'Bad request' } } }
    expect(getAxiosErrorMessage(err)).toBe('Bad request')
  })

  it('falls back to err.message', () => {
    const err = new Error('Network failed')
    expect(getAxiosErrorMessage(err)).toBe('Network failed')
  })

  it('uses custom fallback when nothing matches', () => {
    expect(getAxiosErrorMessage(null, 'Default')).toBe('Default')
    expect(getAxiosErrorMessage({}, 'Default')).toBe('Default')
  })

  it('prioritizes response.data.message over err.message', () => {
    const err = { message: 'Generic', response: { data: { message: 'Specific' } } }
    expect(getAxiosErrorMessage(err)).toBe('Specific')
  })
})
