import { FirebaseError } from 'firebase/app'

export type FirebaseAuthErrorContext = 'signIn' | 'signUp' | 'passwordReset' | 'accountAction'

export function getFirebaseAuthErrorCode(error: unknown): string | null {
  if (error instanceof FirebaseError && typeof error.code === 'string' && error.code.startsWith('auth/')) {
    return error.code
  }
  if (error instanceof Error) {
    const match = error.message.match(/\(auth\/[a-z0-9/-]+\)/i)
    if (match) {
      return match[0].slice(1, -1)
    }
  }
  return null
}

export function isFirebaseAuthError(error: unknown): boolean {
  return getFirebaseAuthErrorCode(error) !== null
}

const DEFAULT_BY_CONTEXT: Record<FirebaseAuthErrorContext, string> = {
  signIn: 'We could not sign you in. Please try again.',
  signUp: 'We could not create your account. Please try again.',
  passwordReset: 'We could not send the reset link. Please try again.',
  accountAction: 'Something went wrong. Please try again.',
}

const STATIC_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address does not look valid. Please check and try again.',
  'auth/user-disabled': 'This account has been disabled. Contact support if you need help.',
  'auth/user-not-found': 'No account exists with this email address. Check the email or sign up.',
  'auth/wrong-password': 'The email or password is incorrect. Try again or use “Forgot password”.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in or use a different email.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters, mix of letters and numbers).',
  'auth/operation-not-allowed': 'Email sign-in is not available right now. Please contact support.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes and try again.',
  'auth/requires-recent-login': 'For security, sign in again before continuing.',
  'auth/missing-email': 'Please enter your email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/internal-error': 'Something went wrong on our side. Please try again in a moment.',
  'auth/invalid-api-key': 'Sign-in is temporarily unavailable. Please try again later.',
  'auth/expired-action-code': 'This link has expired. Request a new reset email or verification link.',
  'auth/invalid-action-code': 'This link is invalid or has already been used. Request a new one.',
  'auth/credential-already-in-use': 'This sign-in method is already linked to another account.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing. Please try again.',
  'auth/cancelled-popup-request': 'Only one sign-in popup can be open at a time. Please try again.',
}

function messageForInvalidCredential(context: FirebaseAuthErrorContext): string {
  switch (context) {
    case 'signIn':
      return 'The email or password is incorrect. Double-check your details or use “Forgot password” to reset your password.'
    case 'signUp':
      return 'We could not verify those details. If you already have an account, sign in instead.'
    case 'passwordReset':
      return 'We could not find an account with that email, or the address is invalid. Check the email and try again.'
    case 'accountAction':
      return 'This link is no longer valid or your session has expired. Request a new link and try again.'
  }
}

function messageForCode(code: string, context: FirebaseAuthErrorContext): string {
  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
    return messageForInvalidCredential(context)
  }
  return STATIC_MESSAGES[code] ?? DEFAULT_BY_CONTEXT[context]
}

/**
 * Maps Firebase Authentication errors (and common `Firebase: Error (auth/...)` messages)
 * to copy suitable for end users.
 */
export function getFirebaseAuthErrorMessage(
  error: unknown,
  context: FirebaseAuthErrorContext = 'signIn'
): string {
  const code = getFirebaseAuthErrorCode(error)
  if (code) {
    return messageForCode(code, context)
  }

  if (error instanceof Error && error.message) {
    if (/Firebase:\s*Error\s*\(auth\//i.test(error.message)) {
      return DEFAULT_BY_CONTEXT[context]
    }
    return error.message
  }

  return DEFAULT_BY_CONTEXT[context]
}
