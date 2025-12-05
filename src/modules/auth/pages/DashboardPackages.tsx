import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardNavbar from '../components/DashboardNavbar'
import ChoosePackageModal from '../components/ChoosePackageModal'
import { catalogService } from '../../catalog/services/catalogService'
import type { CatalogProduct } from '../../../types'

export default function DashboardPackages() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

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
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await catalogService.searchCategoryProducts('website', { 
          page: 1, 
          limit: 100 
        })
        setProducts(response.data)
        setError(null)
      } catch (err) {
        setError('Failed to load packages. Please try again later.')
        console.error('Error fetching packages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [])

  const featured = useMemo(() => products.slice(0, 3), [products])
  const remaining = useMemo(() => products.slice(3), [products])

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

  const parseFeatures = (description: string): string[] => {
    if (!description) return []
    const features = description.split('\n').filter(f => f.trim())
    return features.length > 0 ? features : [description]
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
                    className={`rounded-2xl p-6 lg:p-6 shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] ${idx === 0 ? 'bg-[#5BA0FF]' : idx === 1 ? 'bg-[#B8FF5B]' : 'bg-[#D8B0FF]'} min-h-[320px] flex flex-col`}
                  >
                    <div className="flex items-center gap-2 text-neutral-900">
                      <img
                        src={`${import.meta.env.BASE_URL}images/${idx === 0 ? 'plan_logo.png' : idx === 1 ? 'sms.png' : 'star.png'}`}
                        alt="icon"
                        className="h-7 w-7"
                      />
                    </div>
                    <h3 className="mt-4 text-neutral-900 font-extrabold text-2xl">{p.name}</h3>
                    <ul className="mt-5 space-y-3 text-neutral-900">
                      {parseFeatures(p.description).slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 size-4 rounded-full bg-white grid place-items-center">
                            <img src={`${import.meta.env.BASE_URL}images/${idx === 0 ? 'plan_logo.png' : idx === 1 ? 'sms.png' : 'star.png'}`} alt="feature icon" className="h-3 w-3" />
                          </span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-900 font-bold text-lg">R{p.price.toFixed(2)}</span>
                        <button onClick={() => setModalOpen(true)} className="inline-block w-28 bg-white text-neutral-900 text-center rounded-lg py-2 font-semibold hover:bg-neutral-100 transition-colors">
                          Buy now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!loading && !error && remaining.length > 0 && (
                <div className="mt-12">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold text-xl">
                      All Packages <span className="text-neutral-500 text-base ml-2">({products.length} total)</span>
                    </h3>
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      {showAll ? 'Show less' : 'View more'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {showAll && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {remaining.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl p-5 bg-neutral-800 border border-neutral-700 hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                        >
                          <h4 className="text-white font-bold text-lg mb-2">{p.name}</h4>
                          <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold">R{p.price.toFixed(2)}</span>
                            <button
                              onClick={() => setModalOpen(true)}
                              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
                            >
                              Buy now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


