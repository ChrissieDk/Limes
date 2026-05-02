import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { crmService } from '../../crm/services/crmService'
import { userHasProvisionedSim } from '../utils/userProvisioning'

const cacheKey = (uid: string) => `limes:display-name:${uid}`

const readCachedDisplayName = (uid: string): string => {
  try {
    return sessionStorage.getItem(cacheKey(uid)) ?? ''
  } catch {
    return ''
  }
}

const writeCachedDisplayName = (uid: string, value: string) => {
  try {
    sessionStorage.setItem(cacheKey(uid), value)
  } catch {
    // no-op
  }
}

/** Call after CRM name changes so the navbar refetches display name. */
export function clearDashboardDisplayNameCache(uid: string) {
  try {
    sessionStorage.removeItem(cacheKey(uid))
  } catch {
    // no-op
  }
}

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Subscriptions', to: '/dashboard/subscriptions' },
  { label: 'Payment Methods', to: '/dashboard/payment-methods' },
  { label: 'Delivery Tracking', to: '/dashboard/delivery-tracking' },
  { label: 'Add a SIM', to: '/dashboard/packages' },
] as const

const PROVISIONED_ONLY_PATHS = new Set<string>([
  '/dashboard',
  '/dashboard/subscriptions',
  '/dashboard/payment-methods',
  '/dashboard/delivery-tracking',
])

const DISABLED_TAB_TITLE = 'Complete your plan and SIM setup first.'

export default function DashboardNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const addSimColor = '#ABFF63'
  const [displayName, setDisplayName] = useState<string>('Account')
  const [hasProvisionedSim, setHasProvisionedSim] = useState<boolean | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const isNavItemActive = (path: string) => pathname === path

  const isTabLocked = (to: string) =>
    PROVISIONED_ONLY_PATHS.has(to) && hasProvisionedSim !== true

  const avatarSeed = useMemo(() => displayName || 'user', [displayName])

  useEffect(() => {
    let fetchCancelled = false

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setDisplayName('Account')
        return
      }

      const uid = firebaseUser.uid

      const cached = readCachedDisplayName(uid)
      if (cached) {
        setDisplayName(cached)
        return
      }

      setDisplayName('Account')
      fetchCancelled = false

      const fetchName = async () => {
        try {
          const customer = await crmService.getAccountCustomer()
          if (fetchCancelled) return

          const first = customer.detail.firstname?.trim() || ''
          const last = customer.detail.lastname?.trim() || ''
          const fullName = `${first} ${last}`.trim()

          if (fullName) {
            setDisplayName(fullName)
            writeCachedDisplayName(uid, fullName)
            return
          }

          const user = await userService.getCurrentUser()
          if (fetchCancelled) return

          const fallbackName = user.displayName?.trim() || user.emailAddress?.trim() || 'Account'
          setDisplayName(fallbackName)
          if (fallbackName !== 'Account') {
            writeCachedDisplayName(uid, fallbackName)
          }
        } catch {
          // Best-effort only; keep fallback label
        }
      }

      fetchName()
    })

    return () => {
      fetchCancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!accountMenuOpen) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (!accountMenuRef.current) return
      if (accountMenuRef.current.contains(target)) return
      setAccountMenuOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [accountMenuOpen])

  useEffect(() => {
    setAccountMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    let cancelled = false

    const loadProvisioned = async () => {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        if (!cancelled) setHasProvisionedSim(null)
        return
      }
      try {
        const user = await userService.getCurrentUser()
        if (!cancelled) setHasProvisionedSim(userHasProvisionedSim(user))
      } catch {
        if (!cancelled) setHasProvisionedSim(false)
      }
    }

    const unsub = onAuthStateChanged(auth, () => {
      void loadProvisioned()
    })

    void loadProvisioned()

    return () => {
      cancelled = true
      unsub()
    }
  }, [pathname])

  useEffect(() => {
    const onPaymentSuccess = () => {
      void (async () => {
        if (!auth.currentUser) return
        try {
          const user = await userService.getCurrentUser()
          setHasProvisionedSim(userHasProvisionedSim(user))
        } catch {
          setHasProvisionedSim(false)
        }
      })()
    }
    window.addEventListener('limes:payment-success', onPaymentSuccess)
    return () => window.removeEventListener('limes:payment-success', onPaymentSuccess)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      navigate('/signin')
    }
  }

  return (
    <div className="sticky top-3 z-20">
      <div className="mx-auto max-w-7xl px-6">
        <nav className="w-full rounded-xl bg-neutral-800 text-white border border-neutral-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Link to={hasProvisionedSim === true ? '/dashboard' : '/dashboard/packages'}>
                <img src={`${import.meta.env.BASE_URL}images/limes_high_def_logo.svg`} alt="Limes" className="h-7" />
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-center flex-1 px-4">
              <ul className="flex items-center gap-7 text-sm whitespace-nowrap">
                {navItems.map((item) => (
                  <li key={item.to}>
                    {isTabLocked(item.to) ? (
                      <span
                        role="link"
                        aria-disabled
                        title={DISABLED_TAB_TITLE}
                        className="group inline-flex flex-col items-center gap-0.5 py-1 opacity-40 cursor-not-allowed select-none"
                      >
                        <span
                          className="font-manrope font-medium transition-colors text-white/50"
                        >
                          {item.label}
                        </span>
                        <span
                          className={`size-1.5 rounded-full transition-opacity ${
                            isNavItemActive(item.to) ? 'opacity-100 bg-white/50' : 'opacity-0'
                          }`}
                        />
                      </span>
                    ) : (
                      <Link
                        to={item.to}
                        className="group inline-flex flex-col items-center gap-0.5 py-1"
                      >
                        <span
                          className="font-manrope font-medium transition-colors"
                          style={{
                            color: item.to === '/dashboard/packages'
                              ? addSimColor
                              : isNavItemActive(item.to)
                              ? '#FFFFFF'
                              : 'rgba(255,255,255,0.9)',
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          className={`size-1.5 rounded-full transition-opacity ${
                            isNavItemActive(item.to) ? 'opacity-100 bg-white' : 'opacity-0'
                          }`}
                        />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:flex items-center justify-end">
              <div ref={accountMenuRef} className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center justify-between gap-2.5 rounded-2xl border border-neutral-700 bg-neutral-800 px-3 py-1.5 hover:bg-white/5 transition-colors min-w-[200px]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(avatarSeed)}`}
                      alt=""
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full flex-shrink-0"
                    />
                    <span className="font-grotesque text-white text-[15px] font-semibold truncate">{displayName}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/80 flex-shrink-0" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg p-2 text-sm">
                    <Link
                      to="/dashboard/edit-details"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-white"
                    >
                      <span className="font-manrope">Edit details</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="font-manrope">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button 
              aria-label="Menu" 
              className="lg:hidden inline-flex items-center justify-center size-10 rounded-lg border border-white/10 hover:bg-white/5 transition" 
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 top-1 block h-0.5 w-5 bg-white transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-white transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 top-4 block h-0.5 w-5 bg-white transform transition-transform duration-300 ${mobileMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </div>
            </button>
          </div>

          <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${mobileMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
            <ul className="px-4 pb-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  {isTabLocked(item.to) ? (
                    <span
                      role="link"
                      aria-disabled
                      title={DISABLED_TAB_TITLE}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm opacity-40 cursor-not-allowed select-none"
                    >
                      <span className="font-manrope font-medium text-white/50">{item.label}</span>
                      <span
                        className={`size-1.5 rounded-full ${
                          isNavItemActive(item.to) ? 'opacity-100 bg-white/50' : 'opacity-0'
                        }`}
                      />
                    </span>
                  ) : (
                    <Link
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5"
                    >
                      <span
                        className="font-manrope font-medium"
                        style={{
                          color: item.to === '/dashboard/packages'
                            ? addSimColor
                            : isNavItemActive(item.to)
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`size-1.5 rounded-full ${
                          isNavItemActive(item.to) ? 'opacity-100 bg-white' : 'opacity-0'
                        }`}
                      />
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-2 border-t border-white/10 mt-2">
                <Link
                  to="/dashboard/edit-details"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-white/5 text-white"
                >
                  Edit details
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  )
}


