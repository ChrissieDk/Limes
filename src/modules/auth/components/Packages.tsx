import { useEffect, useMemo, useRef } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import type { CatalogProduct } from '../../../types'
import Button from './Button'

export default function Packages() {
  const products = useMemo<CatalogProduct[]>(
    () => [
      {
        id: 'pkg-mobile-starter',
        sku: 'MOB-START',
        name: 'Starter Mobile',
        description: 'Prepaid SIM with 2GB data, 50 minutes, 100 SMS. Perfect for light usage.',
        price: 99,
        brand: 'Limes Mobile',
        displayOrder: 1,
        isAdHoc: false,
      },
      {
        id: 'pkg-mobile-value',
        sku: 'MOB-VALUE',
        name: 'Value 10GB',
        description: '10GB data, 200 minutes, 500 SMS. Best monthly value.',
        price: 299,
        brand: 'Limes Mobile',
        displayOrder: 2,
        isAdHoc: false,
      },
      {
        id: 'pkg-mobile-unlimited',
        sku: 'MOB-UNLIM',
        name: 'Unlimited Max',
        description: 'Unlimited calls to SA networks + 30GB data FUP + Unlimited SMS.',
        price: 599,
        brand: 'Limes Mobile',
        displayOrder: 3,
        isAdHoc: false,
      },
    ],
    []
  )

  const glowRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const posRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const targetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  const animateGlow = () => {
    const { x, y } = posRef.current
    const { x: tx, y: ty } = targetRef.current
    const nx = x + (tx - x) * 0.18
    const ny = y + (ty - y) * 0.18
    posRef.current = { x: nx, y: ny }
    if (glowRef.current) {
      glowRef.current.style.setProperty('--gx', `${nx}px`)
      glowRef.current.style.setProperty('--gy', `${ny}px`)
    }
    rafRef.current = requestAnimationFrame(animateGlow)
  }

  const handleBGMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    targetRef.current = { x, y }
    if (glowRef.current) glowRef.current.style.opacity = '1'
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(animateGlow)
  }

  const handleBGMouseLeave = () => {
    if (glowRef.current) glowRef.current.style.opacity = '0'
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const featured = useMemo(() => {
    return [...products]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.price - b.price)
      .slice(0, 3)
  }, [products])

  return (
    <section id="packages" className="relative bg-neutral-900">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex items-center justify-center text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Our Packages
        </div>
        <h2 className="mt-3 text-center font-grotesque font-extrabold text-white text-[36px] sm:text-[48px] md:text-[56px] leading-[1.05]">
          Flexible, rewarding, and hassle-free
        </h2>
        <p className="mt-3 text-center text-neutral-400">Find all 3 Limes. Get 15% off.</p>
      </div>

      {/* Full-width background block containing the cards */}
      <div className="mt-10 relative" onMouseMove={handleBGMouseMove} onMouseLeave={handleBGMouseLeave}>
        {/* Grid backdrop: subtle light grid over same bg color, full width */}
        <div className="absolute inset-0 bg-neutral-900" />
        <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:100px_100px]" />
        {/* Hover glow snapped to grid cells */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
          style={{ background: 'radial-gradient(220px circle at var(--gx, -9999px) var(--gy, -9999px), rgba(255,255,255,0.08), transparent 60%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured.map((p, idx) => (
              <div
                key={p.id}
                className={`rounded-2xl p-6 lg:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] ${idx === 0 ? 'bg-[#5BA0FF]' : idx === 1 ? 'bg-[#B8FF5B]' : 'bg-[#D8B0FF]'} min-h-[320px]`}
              >
                <div className="flex items-center gap-2 text-neutral-900">
                  <span className="size-7 rounded-lg bg-white grid place-items-center">✦</span>
                </div>
                <h3 className="mt-4 text-neutral-900 font-extrabold text-2xl">{p.name}</h3>
                <ul className="mt-5 space-y-3 text-neutral-900">
                  <li className="flex items-start gap-2"><span className="mt-1 size-4 rounded-full bg-white grid place-items-center">💠</span><span>{p.description}</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-4 rounded-full bg-white grid place-items-center">💠</span><span>Brand: {p.brand}</span></li>
                  <li className="flex items-start gap-2"><span className="mt-1 size-4 rounded-full bg-white grid place-items-center">💠</span><span>Display order: {p.displayOrder}</span></li>
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-neutral-900 font-extrabold text-xl">{p.price > 0 ? `R${p.price}` : 'Custom'}</div>
                  <div className="w-36"><Button variant="secondary">Contact Us</Button></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


