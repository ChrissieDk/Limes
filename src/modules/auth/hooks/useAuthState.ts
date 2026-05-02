import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../config/firebase'

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
    })
    return unsubscribe
  }, [])

  return { ready, user }
}
