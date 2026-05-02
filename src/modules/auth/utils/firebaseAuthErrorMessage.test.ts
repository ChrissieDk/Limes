import { describe, it, expect } from 'vitest'
import { FirebaseError } from 'firebase/app'
import {
  getFirebaseAuthErrorCode,
  isFirebaseAuthError,
  getFirebaseAuthErrorMessage,
} from './firebaseAuthErrorMessage'

describe('getFirebaseAuthErrorCode', () => {
  it('extracts code from FirebaseError instance', () => {
    const error = new FirebaseError('auth/user-not-found', 'User not found')
    expect(getFirebaseAuthErrorCode(error)).toBe('auth/user-not-found')
  })

  it('extracts code from Error message', () => {
    const error = new Error('Firebase: Error (auth/wrong-password).')
    expect(getFirebaseAuthErrorCode(error)).toBe('auth/wrong-password')
  })

  it('returns null for non-auth errors', () => {
    expect(getFirebaseAuthErrorCode(new Error('Something else'))).toBeNull()
    expect(getFirebaseAuthErrorCode(null)).toBeNull()
    expect(getFirebaseAuthErrorCode('string')).toBeNull()
  })
})

describe('isFirebaseAuthError', () => {
  it('returns true for Firebase auth errors', () => {
    expect(isFirebaseAuthError(new FirebaseError('auth/invalid-email', ''))).toBe(true)
  })

  it('returns false for regular errors', () => {
    expect(isFirebaseAuthError(new Error('Regular'))).toBe(false)
  })
})

describe('getFirebaseAuthErrorMessage', () => {
  it('returns user-friendly message for known auth codes', () => {
    const error = new FirebaseError('auth/user-not-found', '')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toContain('No account exists')
  })

  it('returns context-specific message for invalid-credential in signIn', () => {
    const error = new FirebaseError('auth/invalid-credential', '')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toContain('email or password is incorrect')
  })

  it('returns context-specific message for invalid-credential in signUp', () => {
    const error = new FirebaseError('auth/invalid-credential', '')
    const message = getFirebaseAuthErrorMessage(error, 'signUp')
    expect(message).toContain('could not verify those details')
  })

  it('returns default context message for unknown codes', () => {
    const error = new FirebaseError('auth/unknown-code', '')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toBe('We could not sign you in. Please try again.')
  })

  it('returns default for passwordReset context', () => {
    const error = new FirebaseError('auth/unknown-code', '')
    const message = getFirebaseAuthErrorMessage(error, 'passwordReset')
    expect(message).toBe('We could not send the reset link. Please try again.')
  })

  it('returns default for accountAction context', () => {
    const error = new FirebaseError('auth/unknown-code', '')
    const message = getFirebaseAuthErrorMessage(error, 'accountAction')
    expect(message).toBe('Something went wrong. Please try again.')
  })

  it('returns error message for non-Firebase errors', () => {
    const error = new Error('Network failed')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toBe('Network failed')
  })

  it('returns default for null error', () => {
    const message = getFirebaseAuthErrorMessage(null, 'signIn')
    expect(message).toBe('We could not sign you in. Please try again.')
  })

  it('handles weak-password code', () => {
    const error = new FirebaseError('auth/weak-password', '')
    const message = getFirebaseAuthErrorMessage(error, 'signUp')
    expect(message).toContain('stronger password')
  })

  it('handles too-many-requests code', () => {
    const error = new FirebaseError('auth/too-many-requests', '')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toContain('Too many attempts')
  })

  it('handles email-already-in-use code', () => {
    const error = new FirebaseError('auth/email-already-in-use', '')
    const message = getFirebaseAuthErrorMessage(error, 'signUp')
    expect(message).toContain('already exists')
  })

  it('handles network-request-failed code', () => {
    const error = new FirebaseError('auth/network-request-failed', '')
    const message = getFirebaseAuthErrorMessage(error, 'signIn')
    expect(message).toContain('Network error')
  })

  it('handles expired-action-code', () => {
    const error = new FirebaseError('auth/expired-action-code', '')
    const message = getFirebaseAuthErrorMessage(error, 'accountAction')
    expect(message).toContain('expired')
  })

  it('handles invalid-action-code', () => {
    const error = new FirebaseError('auth/invalid-action-code', '')
    const message = getFirebaseAuthErrorMessage(error, 'accountAction')
    expect(message).toContain('invalid or has already been used')
  })
})
