import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

const navItems = [
  { href: '/#hero', label: 'Home', sub: 'Start' , dot: 'bg-indigo-400' },
  { href: '/#why', label: 'Why Choose', sub: 'Benefits', dot: 'bg-purple-400' },
  { href: '/#packages', label: 'Packages', sub: 'Plans', dot: 'bg-pink-400' },
  { href: '/#partners', label: 'Partners', sub: 'Network', dot: 'bg-lime-400' },
  { href: '/contact', label: 'Contact', sub: 'Help', dot: 'bg-yellow-400', isRoute: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onHash = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A') setOpen(false)
    }
    document.addEventListener('click', onHash)
    return () => document.removeEventListener('click', onHash)
  }, [])

  return (
    <div className="sticky top-3 z-10">
      <nav className="mx-auto max-w-6xl rounded-xl bg-white text-black shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-8">
            <img src={`${import.meta.env.BASE_URL}images/Logo.png`} alt="Limes" className="h-10" />
          </div>

          <ul className="hidden md:flex gap-6 text-[15px]">
            {navItems.map((item) => (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} className="group inline-flex flex-col items-center">
                    <span className="font-medium transition-colors duration-200 group-hover:text-neutral-900">{item.label}</span>
                    <span className={`mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${item.dot}`} />
                  </Link>
                ) : (
                  <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group inline-flex flex-col items-center">
                    <span className="font-medium transition-colors duration-200 group-hover:text-neutral-900">{item.label}</span>
                    <span className={`mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${item.dot}`} />
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link to="/faqs" className="group inline-flex flex-col items-center">
                <span className="font-medium transition-colors duration-200 group-hover:text-neutral-900">FAQs</span>
                <span className="mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-purple-400" />
              </Link>
            </li>
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/signin">
              <button className="h-12 px-4 text-sm font-semibold border-2 border-black/70 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] bg-white text-black hover:bg-neutral-50 transition-colors cursor-pointer">
                Sign In
              </button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </div>

          <button aria-label="Menu" className="md:hidden inline-flex items-center justify-center size-10 rounded-lg ring-1 ring-neutral-200 hover:bg-neutral-100 transition" onClick={() => setOpen((v) => !v)}>
            <div className="relative w-5 h-5">
              <span className={`absolute left-0 top-1 block h-0.5 w-5 bg-black transform transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-black transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 top-4 block h-0.5 w-5 bg-black transform transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>

          <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-[500px]' : 'max-h-0'}`}>
          <ul className="px-5 pb-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                {item.isRoute ? (
                  <Link to={item.href} className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100 transition">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${item.dot}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-neutral-400">›</span>
                  </Link>
                ) : (
                  <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100 transition">
                    <div className="flex items-center gap-3">
                      <span className={`size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${item.dot}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-neutral-400">›</span>
                  </a>
                )}
              </li>
            ))}
            <li>
              <Link to="/faqs" className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100 transition">
                <div className="flex items-center gap-3">
                  <span className="size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-purple-400" />
                  <span className="text-sm font-medium">FAQs</span>
                </div>
                <span className="text-neutral-400">›</span>
              </Link>
            </li>
            <li className="pt-2 space-y-2">
              <Link to="/signin">
                <button className="w-full px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors">
                  Sign In
                </button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" className="w-full">Sign Up</Button>
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  )
}


