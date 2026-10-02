import firebaseFunctionsTest from 'firebase-functions-test'
import { describe, expect, it, afterAll } from 'vitest'
import { sendPasswordResetEmail, submitContactInquiry } from './index'

const functionsTest = firebaseFunctionsTest()
const sendPasswordReset = functionsTest.wrap(sendPasswordResetEmail)
const submitContact = functionsTest.wrap(submitContactInquiry)

describe('callable Functions boundary validation', () => {
  it('rejects malformed password-reset input before contacting Firebase Auth', async () => {
    await expect(sendPasswordReset({ email: 'not-an-email' })).rejects.toMatchObject({
      code: 'invalid-argument',
    })
  })

  it('rejects incomplete contact inquiries before sending email', async () => {
    await expect(submitContact({ email: 'person@example.com' })).rejects.toMatchObject({
      code: 'invalid-argument',
    })
  })
})

afterAll(() => {
  functionsTest.cleanup()
})
