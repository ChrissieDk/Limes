import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../config/firebase'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How Limes Works', isRoute: true },
  { href: '/#packages', label: 'Subscriptions' },
  { href: '/partners', label: 'For Businesses', isRoute: true },
  { href: '/contact', label: 'Contact', isRoute: true },
]

function isNavLinkActive(item: typeof navLinks[number], pathname: string, hash: string) {
  if (item.isRoute) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }
  const expectedHash = item.href.includes('#') ? item.href.replace(/^.*#/, '#') : ''
  return pathname === '/' && hash === expectedHash
}

const pillBase = 'font-manrope text-[15px] font-medium rounded-full px-3.5 py-1.5 transition-colors duration-200'
const pillClass = (active: boolean, home = false) =>
  `${pillBase} ${active ? (home ? 'bg-pink-300' : 'bg-[#ABFF63]') + ' text-black' : 'text-white hover:bg-white/10'}`

const loginBtn = 'h-10 px-4 inline-flex items-center text-sm font-manrope font-bold rounded-lg bg-white text-black hover:bg-white/90 transition-colors'
const registerBtn = 'h-10 px-4 inline-flex items-center text-sm font-manrope font-bold rounded-lg bg-[#ABFF63] text-black hover:bg-[#99FF4D] transition-colors'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, hash } = useLocation()

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <div className="fixed top-3 left-0 right-0 z-50 px-3 sm:px-0">
      <nav
        aria-label="Primary navigation"
        className={`w-full mx-auto max-w-6xl rounded-xl text-white shadow-sm ring-1 transition-all duration-300 ${
          scrolled
            ? 'bg-[#26252C]/75 backdrop-blur-xl ring-white/20 shadow-lg'
            : 'bg-[#26252C] ring-white/10'
        }`}
      >
        <div className="flex md:grid md:grid-cols-[1fr_auto_1fr] items-center justify-between md:justify-normal px-5 py-3">
          <div className="flex items-center gap-8 justify-self-start">
            <Link to="/">
              <img src={`${import.meta.env.BASE_URL}images/limes-mobile_horizontal.svg`} alt="Limes" className="h-7" />
            </Link>
          </div>

          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const active = isNavLinkActive(item, pathname, hash)
              return (
                <li key={item.href}>
                  {item.isRoute || item.href === '/' ? (
                    <Link to={item.href} className={`inline-block ${pillClass(active, item.href === '/')}`}>{item.label}</Link>
                  ) : (
                    <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className={`inline-block ${pillClass(active, item.href === '/')}`}>{item.label}</a>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-3 justify-self-end">
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <Link to="/dashboard" className={registerBtn}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/signin" className={loginBtn}>Log in</Link>
                  <Link to="/register" className={registerBtn}>Register</Link>
                </>
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
          <ul className="px-5 pb-4 space-y-1">
            {navLinks.map((item) => {
              const active = isNavLinkActive(item, pathname, hash)
              const cls = `block ${pillClass(active, item.href === '/')} px-4 py-2.5`
              return (
                <li key={item.href}>
                  {item.isRoute || item.href === '/' ? (
                    <Link to={item.href} className={cls}>{item.label}</Link>
                  ) : (
                    <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className={cls}>{item.label}</a>
                  )}
                </li>
              )
            })}
            <li className="pt-2 flex gap-2">
              {isLoggedIn ? (
                <Link to="/dashboard" className={`${registerBtn} flex-1 justify-center`}>Dashboard</Link>
              ) : (
                <>
                  <Link to="/signin" className={`${loginBtn} flex-1 justify-center`}>Log in</Link>
                  <Link to="/register" className={`${registerBtn} flex-1 justify-center`}>Register</Link>
                </>
              )}
            </li>
          </ul>
        </div>
      </nav>
      </div>
      <div className="h-[84px]" aria-hidden="true" />
    </>
  )
}
