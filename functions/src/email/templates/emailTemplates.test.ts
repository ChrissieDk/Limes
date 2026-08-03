import { describe, expect, it } from 'vitest'
import { getPasswordResetEmailHtml } from './passwordResetEmail'
import { getVerificationEmailHtml } from './verificationEmail'

describe('email templates', () => {
  it('renders a password reset email with the recipient and link', () => {
    const html = getPasswordResetEmailHtml('Ada', 'https://example.com/reset?code=abc')

    expect(html).toContain('Hi Ada')
    expect(html).toContain('https://example.com/reset?code=abc')
    expect(html).toContain('Reset Password')
    expect(html).toContain('Password Reset')
  })

  it('uses a safe fallback name for verification emails', () => {
    const html = getVerificationEmailHtml('', 'https://example.com/verify?code=xyz')

    expect(html).toContain('Hi there')
    expect(html).toContain('https://example.com/verify?code=xyz')
    expect(html).toContain('Verify Email Address')
    expect(html).toContain('Email Verification')
  })
})
