import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../config/firebase'

type Props = {
  children: ReactNode
}

/**
 * Route guard that redirects unauthenticated users to /signin.
 * Uses Firebase's onAuthStateChanged so it reacts to sign-out events.
 *
 * NOTE: App.tsx already waits for the initial auth state before rendering
 * routes, so this will resolve immediately on first mount.
 */
export default function AuthenticatedRoute({ children }: Props) {
  const [user, setUser] = useState(auth.currentUser)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return unsubscribe
  }, [])

  if (user === null) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}
