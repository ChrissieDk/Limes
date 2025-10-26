import { useEffect, useState } from 'react'
import Button from './Button'

const navItems = [
  { href: '/#hero', label: 'Home', sub: 'Start' , dot: 'bg-indigo-400' },
  { href: '/#why', label: 'Why Choose', sub: 'Benefits', dot: 'bg-purple-400' },
  { href: '/#packages', label: 'Packages', sub: 'Plans', dot: 'bg-pink-400' },
  { href: '/#partners', label: 'Partners', sub: 'Network', dot: 'bg-lime-400' },
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
                <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group inline-flex flex-col items-center">
                  <span className="font-medium transition-colors duration-200 group-hover:text-neutral-900">{item.label}</span>
                  <span className={`mt-1 size-1.5 rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${item.dot}`} />
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:block w-36">
            <a href={`${import.meta.env.BASE_URL}contact`}><Button variant="primary">Contact Us</Button></a>
          </div>

          <button aria-label="Menu" className="md:hidden inline-flex items-center justify-center size-10 rounded-lg ring-1 ring-neutral-200 hover:bg-neutral-100 transition" onClick={() => setOpen((v) => !v)}>
            <div className="relative w-5 h-5">
              <span className={`absolute left-0 top-1 block h-0.5 w-5 bg-black transform transition-transform duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-black transition-opacity duration-300 ${open ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`absolute left-0 top-4 block h-0.5 w-5 bg-black transform transition-transform duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>

          <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${open ? 'max-h-80' : 'max-h-0'}`}>
          <ul className="px-5 pb-4 space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a href={`${import.meta.env.BASE_URL}${item.href.replace(/^\//,'')}`} className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100 transition">
                  <div className="flex items-center gap-3">
                    <span className={`size-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${item.dot}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-neutral-400">›</span>
                </a>
              </li>
            ))}
            <li className="pt-2"><a href={`${import.meta.env.BASE_URL}contact`}><Button variant="primary" className="w-full">Contact Us</Button></a></li>
          </ul>
        </div>
      </nav>
    </div>
  )
}


