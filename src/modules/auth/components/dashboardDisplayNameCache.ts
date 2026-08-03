const cacheKey = (uid: string) => `limes:display-name:${uid}`

export function clearDashboardDisplayNameCache(uid: string): void {
  try {
    sessionStorage.removeItem(cacheKey(uid))
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}
