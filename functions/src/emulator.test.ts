import { describe, expect, it } from 'vitest'

const emulatorUrl = process.env.FUNCTIONS_EMULATOR_URL ?? 'http://127.0.0.1:5001/limes-38ec3/us-central1'

describe('Firebase Functions emulator', () => {
  it('rejects invalid callable contact data at the deployed HTTP boundary', async () => {
    const response = await fetch(`${emulatorUrl}/submitContactInquiry`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ data: { email: 'not-an-email' } }),
    })
    const body = await response.json() as { error?: { status?: string } }

    expect(response.status).toBe(400)
    expect(body.error?.status).toBe('INVALID_ARGUMENT')
  })
})
