import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Packages', to: '/dashboard/packages' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Subscriptions', to: '/dashboard/subscriptions' },
  { label: 'Payment Methods', to: '/dashboard/payment-methods' },
  // { label: 'Address Book', to: '/dashboard/address-book' },
  // { label: 'Wallet', to: '/dashboard/wallet' },
]

export default function DashboardNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        <nav className="w-full rounded-xl bg-[#26252C] text-white border border-white/10">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard">
                <img src={`${import.meta.env.BASE_URL}images/limes_high_def_logo.svg`} alt="Limes" className="h-7" />
              </Link>
            </div>

            {/* Desktop Nav - Single line with adjusted spacing */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-4">
              <ul className="flex items-center gap-3 text-xs whitespace-nowrap">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={
                        pathname === item.to
                          ? 'bg-white text-neutral-900 rounded-lg px-3 py-2 font-medium inline-block'
                          : 'text-white/90 hover:text-white px-3 py-2 inline-block'
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop Account Menu */}
            <div className="hidden lg:flex items-center justify-end">
              <div className="relative">
                <button
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#26252C] px-2.5 py-1.5 text-sm hover:bg-white/5 transition-colors"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/thumbs/svg?seed=user`}
                    alt="User"
                    className="w-6 h-6 rounded-full"
                  />
                  <span>Account</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-white/10 bg-[#26252C] shadow-lg p-2 text-sm">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Burger Menu Button */}
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

          {/* Mobile Menu */}
          <div className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ${mobileMenuOpen ? 'max-h-[500px]' : 'max-h-0'}`}>
            <ul className="px-4 pb-4 space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={
                      pathname === item.to
                        ? 'block bg-white text-neutral-900 rounded-lg px-3 py-2.5 text-sm font-medium'
                        : 'block text-white/90 hover:bg-white/5 rounded-lg px-3 py-2.5 text-sm transition-colors'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <button
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


