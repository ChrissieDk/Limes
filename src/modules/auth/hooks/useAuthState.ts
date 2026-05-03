import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import * as Sentry from '@sentry/react'
import { auth } from '../../../config/firebase'
import { setSentryUser, clearSentryUser } from '../../../lib/sentry-logger'

/**
 * Tracks Firebase auth initialization state.
 * Firebase Auth restores sessions asynchronously from IndexedDB on page reload.
 * This hook lets the app wait until auth state is known before rendering routes.
 */
export function useAuthState(): { ready: boolean; user: typeof auth.currentUser } {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setReady(true)

      if (u) {
        // Attach user context to every Sentry event + log
        setSentryUser(u.uid, u.email || undefined, u.displayName || undefined)
        Sentry.logger.info('auth_state_changed', {
          event: 'signed_in',
          user_id: u.uid,
          has_email: !!u.email,
          email_verified: u.emailVerified,
        })
      } else {
        clearSentryUser()
        Sentry.logger.info('auth_state_changed', { event: 'signed_out' })
      }
    })

    return unsubscribe
  }, [])

  return { ready, user }
}
