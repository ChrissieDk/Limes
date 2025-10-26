import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar'
import type { CatalogProduct } from '../../../types'
import { catalogService } from '../../catalog/services/catalogService'
import ChoosePackageModal from '../components/ChoosePackageModal'

export default function DashboardPackages() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

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

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        // Try mobile category first
        const res = await catalogService.searchCategoryProducts('mobile', { page: 1, limit: 20 })
        const first = Array.isArray(res?.data) ? res.data : Array.isArray((res as any)?.items) ? (res as any).items : Array.isArray((res as any)?.data?.data) ? (res as any).data.data : []
        if (!cancelled && first.length > 0) {
          setProducts(first)
        } else {
          // Fallback to website category if mobile returns empty
          const resFallback = await catalogService.searchCategoryProducts('website', { page: 1, limit: 20 })
          const second = Array.isArray(resFallback?.data) ? resFallback.data : Array.isArray((resFallback as any)?.items) ? (resFallback as any).items : Array.isArray((resFallback as any)?.data?.data) ? (resFallback as any).data.data : []
          if (!cancelled) setProducts(second)
          if (!cancelled && second.length === 0) setError('No packages available')
        }
      } catch (e) {
        if (!cancelled) setError('Failed to load packages')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const featured = useMemo(() => {
    return [...products]
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.price - b.price)
      .slice(0, 3)
  }, [products])

  const handleBGMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <ChoosePackageModal open={modalOpen} onClose={() => setModalOpen(false)} />
        <section className="relative bg-neutral-900">
          <div className="mx-auto max-w-6xl px-2 sm:px-6 pt-2 sm:pt-6">
            <div className="flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Packages
            </div>
            <h2 className="mt-3 text-center font-grotesque font-extrabold text-white text-[28px] sm:text-[40px] md:text-[48px] leading-[1.05]">
              Your top options
            </h2>
            <p className="mt-2 text-center text-neutral-400">We picked the top three for you.</p>
          </div>

          <div className="mt-6 relative" onMouseMove={handleBGMouseMove} onMouseLeave={handleBGMouseLeave}>
            <div className="absolute inset-0 bg-neutral-900" />
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:100px_100px]" />
            <div
              ref={glowRef}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200"
              style={{ background: 'radial-gradient(220px circle at var(--gx, -9999px) var(--gy, -9999px), rgba(255,255,255,0.08), transparent 60%)' }}
            />

            <div className="relative mx-auto max-w-6xl px-2 sm:px-6 lg:px-10 py-6 sm:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {loading && (
                  <div className="col-span-1 lg:col-span-3 text-center text-neutral-400">Loading packages…</div>
                )}
                {error && (
                  <div className="col-span-1 lg:col-span-3 text-center text-red-400">{error}</div>
                )}
                {!loading && !error && featured.map((p, idx) => (
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
                      <button onClick={() => setModalOpen(true)} className="inline-block w-36 bg-white text-neutral-900 text-center rounded-lg py-2 font-semibold">Choose</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


