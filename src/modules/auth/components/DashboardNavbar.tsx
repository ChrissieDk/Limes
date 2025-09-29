import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Address Book', to: '/dashboard/address-book' },
  { label: 'Wallet', to: '/dashboard/wallet' },
]

export default function DashboardNavbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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
          <div className="grid grid-cols-3 items-center px-4 py-2.5">
          <div className="flex items-center">
            <img src="/images/Logo.png" alt="Limes" className="h-8" />
          </div>

          <div className="hidden md:flex items-center justify-center">
            <ul className="flex gap-6 text-sm">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className={
                      pathname === item.to
                        ? 'bg-white text-neutral-900 rounded-lg px-3 py-1.5'
                        : 'text-white/90 hover:text-white'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex items-center justify-end">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-sm"
            >
              <img
                src={`https://api.dicebear.com/7.x/thumbs/svg?seed=user`}
                alt="User"
                className="w-6 h-6 rounded-full"
              />
              <span>Account</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg p-2 text-sm">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          </div>
        </nav>
      </div>
    </div>
  )
}


