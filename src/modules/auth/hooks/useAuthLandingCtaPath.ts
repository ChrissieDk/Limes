import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../config/firebase'

export type AuthLandingGuestPath = '/signin' | '/signup'

const authenticatedLandingCtaPath = '/dashboard/packages'

export function useAuthLandingCtaPath(guestPath: AuthLandingGuestPath): string {
  const [path, setPath] = useState<string>(() => (auth.currentUser ? authenticatedLandingCtaPath : guestPath))

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setPath(user ? authenticatedLandingCtaPath : guestPath)
    })
    return unsub
  }, [guestPath])

  return path
}
