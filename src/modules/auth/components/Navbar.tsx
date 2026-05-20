import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../config/firebase'

const navLinks = [
  { href: '/#hero', label: 'Home', dot: 'bg-indigo-400' },
  { href: '/#why', label: 'Why Choose', dot: 'bg-purple-400' },
  { href: '/how-to', label: "How To's", dot: 'bg-lime-400', isRoute: true },
  { href: '/#packages', label: 'Packages', dot: 'bg-pink-400' },
  { href: '/#partners', label: 'Partners', dot: 'bg-blue-400', isRoute: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const onHash = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A') setOpen(false)
    }
    document.addEventListener('click', onHash)
    return () => document.removeEventListener('click', onHash)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user)
    })
    return unsubscribe
  }, [])

  return (
    <div className="sticky top-3 z-10 px-3 sm:px-0">
      <nav className="w-full mx-auto max-w-6xl rounded-xl bg-[#26252C] text-white shadow-sm ring-1 ring-white/10">
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal px-5 py-3">
          <div className="flex items-center gap-8 justify-self-start">
            <Link to="/">
              <img src={`${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`} alt="Limes" className="h-7" />
            </Link>
          </div>

          <ul className="hidden md:flex gap-6 text-[15px]">
            {navLinks.map((item) => (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} className="group inline-flex flex-col items-center">
                    <span className="font-manrope font-medium transition-colors duration-200 group-hover:text-white">{item.label}</span>
                    <span className={`mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${item.dot}`} />
                  </Link>
                ) : (
                  <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group inline-flex flex-col items-center">
                    <span className="font-manrope font-medium transition-colors duration-200 group-hover:text-white">{item.label}</span>
                    <span className={`mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${item.dot}`} />
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link to="/faqs" className="group inline-flex flex-col items-center">
                <span className="font-medium transition-colors duration-200 group-hover:text-white">FAQs</span>
                <span className="mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-purple-400" />
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-3 justify-self-end">
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <button className="h-12 px-4 text-base font-manrope font-bold border-2 border-black/70 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] bg-[#ABFF63] text-black hover:bg-[#ABFF63]/90 transition-colors cursor-pointer">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link to="/signin">
                  <button className="h-12 px-4 text-base font-manrope font-bold border-2 border-black/70 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] bg-[#ABFF63] text-black hover:bg-[#ABFF63]/90 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </Link>
              )}
            </div>

            <button aria-label="Menu" className="md:hidden inline-flex items-center justify-center size-10 rounded-lg ring-1 ring-white/15 hover:bg-white/5 transition" onClick={() => setOpen((v) => !v)}>
              <div className="relative w-5 h-5">
                <span className={`absolute left-0 top-1 block h-0.5 w-5 bg-white transform transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-white transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute left-0 top-4 block h-0.5 w-5 bg-white transform transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
              </div>
            </button>
          </div>
        </div>

          <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-[500px]' : 'max-h-0'}`}>
          <ul className="px-5 pb-4 space-y-2">
            {navLinks.map((item) => (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${item.dot}`} />
                      <span className="font-manrope text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-white/40">›</span>
                  </Link>
                ) : (
                  <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${item.dot}`} />
                      <span className="font-manrope text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-white/40">›</span>
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link to="/faqs" className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-white/5 transition">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-purple-400" />
                  <span className="font-manrope text-sm font-medium">FAQs</span>
                </div>
                <span className="text-white/40">›</span>
              </Link>
            </li>
            <li className="pt-2 space-y-2">
              {isLoggedIn ? (
                <Link to="/dashboard">
                  <button className="w-full px-4 py-2.5 text-base font-manrope font-bold text-black bg-[#ABFF63] hover:bg-[#ABFF63]/90 rounded-xl transition-colors">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <Link to="/signin">
                  <button className="w-full px-4 py-2.5 text-base font-manrope font-bold text-black bg-[#ABFF63] hover:bg-[#ABFF63]/90 rounded-xl transition-colors">
                    Sign In
                  </button>
                </Link>
              )}
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}
