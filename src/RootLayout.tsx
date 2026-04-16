import { useLayoutEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export default function RootLayout() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    const hasLandingSectionHash = pathname === '/' && hash.length > 1
    if (hasLandingSectionHash) {
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return <Outlet />
}
