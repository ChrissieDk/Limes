import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar'
import ChoosePackageModal from '../components/ChoosePackageModal'
import { catalogService } from '../../catalog/services/catalogService'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'

type PackageType = 'contract' | 'prepaid' | null
type SimStatus = 'has-sim' | 'needs-sim' | null

// Product ID mapping based on API responses
// CRITICAL: SA = SIM in hand (already have SIM)
//           SOA = Need SIM delivered (don't have SIM yet)
const PRODUCT_IDS = {
  PREPAID_SA: '7029225P',      // Prepaid - SIM in hand (already have SIM)
  PREPAID_SOA: '7025225P',     // Prepaid - Need SIM delivered
  CONTRACT_SOA: '7023225P',    // Contract - Need SIM delivered
  STAFF_SOA: '7024225P',       // Staff - Need SIM delivered
} as const

export default function DashboardPackages() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  
  // New selection states
  const [packageType, setPackageType] = useState<PackageType>(null)
  const [simStatus, setSimStatus] = useState<SimStatus>(null)
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedBundleCategory, setSelectedBundleCategory] = useState<string | null>(null)
  const [showPackages, setShowPackages] = useState(false)
  
  // Store selected package for the entire flow
  const [selectedPackage, setSelectedPackage] = useState<CatalogProduct | null>(null)
  
  // Track the actual SIM package product ID (the parent product from SA/SOA categories)
  const [simPackageProductId, setSimPackageProductId] = useState<string | null>(null)

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

  // Fetch bundle categories for SOA flow (needs-sim)
  useEffect(() => {
    if (simStatus !== 'needs-sim') return

    const fetchBundleCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })
        console.log('[Catalog] Full category tree:', tree)
        
        // Navigate: tree -> channel -> website -> gsm_products -> children
        const channel = tree.find((node) => node.id === 'channel')
        
        if (!channel) {
          setError('Channel category not found')
          console.error('[Catalog] Channel node not found in tree')
          return
        }
        
        const website = channel.children?.find((node) => node.id === 'website')
        
        if (!website) {
          setError('Website category not found')
          console.error('[Catalog] Website node not found under channel')
          return
        }
        
        const gsmProducts = website.children?.find((node) => node.id === 'gsm_products')
        
        if (!gsmProducts) {
          setError('GSM Products category not found')
          console.error('[Catalog] gsm_products node not found under website')
          return
        }
        
        if (gsmProducts.children && gsmProducts.children.length > 0) {
          setBundleCategories(gsmProducts.children)
          console.log('[Catalog] Bundle categories:', gsmProducts.children)
        } else {
          setError('No bundle categories found')
          console.error('[Catalog] No children found under gsm_products')
        }
      } catch (err) {
        setError('Failed to load bundle categories. Please try again later.')
        console.error('Error fetching bundle categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBundleCategories()
  }, [simStatus])

  // Fetch products from selected bundle category
  useEffect(() => {
    if (!selectedBundleCategory) return
    
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch actual products from the selected bundle category
        // e.g., /api/catalog/products/category/combo_deals
        const response = await catalogService.searchCategoryProducts(selectedBundleCategory, { 
          page: 1, 
          limit: 100 
        })
        
        setProducts(response.data)
        console.log(`[Catalog] Fetched products from ${selectedBundleCategory}:`, response)
        
        // Determine SIM package product ID based on package type and SIM status
        // This is just metadata, NOT the product to display
        let simPkgId = null
        if (packageType === 'contract') {
          // Contract always needs SIM delivery (SOA)
          simPkgId = PRODUCT_IDS.CONTRACT_SOA
        } else if (packageType === 'prepaid') {
          if (simStatus === 'has-sim') {
            // Prepaid with SIM in hand (SA)
            simPkgId = PRODUCT_IDS.PREPAID_SA
          } else {
            // Prepaid needs SIM delivery (SOA)
            simPkgId = PRODUCT_IDS.PREPAID_SOA
          }
        }
        setSimPackageProductId(simPkgId)
        console.log('[Catalog] SIM package type:', simPkgId, '(metadata only)')
        
      } catch (err) {
        setError('Failed to load packages. Please try again later.')
        console.error('Error fetching packages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [selectedBundleCategory, packageType, simStatus])

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

  const parseFeatures = (description?: string): string[] => {
    if (!description) return []
    const features = description.split('\n').filter(f => f.trim())
    return features.length > 0 ? features : [description]
  }

  // Determine if a product is once-off or monthly subscription
  // Based on your backend plan configuration
  const getPlanChargeType = (productId: string): 'once-off' | 'monthly' => {
    // Monthly plan IDs configured in Paystack as recurring subscriptions
    // 40021 - Your original test plan
    // 40022 - 300MB - R20 plan (PLN_h1tdp1icb27ss2w)
    const monthlyPlanIds = ['40021', '40022']
    
    // Check if this product ID is in your monthly plans
    if (monthlyPlanIds.includes(productId)) {
      return 'monthly'
    }
    
    // Default to once-off for other products
    // You can adjust this logic based on your product catalog
    return 'once-off'
  }

  const handlePackageTypeSelect = (type: PackageType) => {
    setPackageType(type)
    setSimStatus(null)
    setShowPackages(false)
    setProducts([])
    setBundleCategories([])
    setSelectedBundleCategory(null)
    setSimPackageProductId(null)
    
    // If contract, automatically set needs-sim and fetch bundle categories
    if (type === 'contract') {
      setSimStatus('needs-sim')
    }
  }

  const handleSimStatusSelect = (status: SimStatus) => {
    setSimStatus(status)
    setSelectedBundleCategory(null)
    setProducts([])
    setSimPackageProductId(null)
    
    // Both SA and SOA need to select bundle category first
    // We don't proceed to packages until bundle category is selected
  }

  const handleBundleCategorySelect = (categoryId: string) => {
    setSelectedBundleCategory(categoryId)
    setShowPackages(true)
  }

  const handleBackFromBundleCategories = () => {
    // If contract, go back to package type selection (step 1)
    // If prepaid, go back to SIM status selection (step 2)
    if (packageType === 'contract') {
      setPackageType(null)
      setSimStatus(null)
    } else {
      setSimStatus(null)
    }
    setBundleCategories([])
    setSelectedBundleCategory(null)
    setShowPackages(false)
    setProducts([])
  }

  const handleBackFromPackages = () => {
    setSelectedBundleCategory(null)
    setShowPackages(false)
    setProducts([])
  }

  const handleReset = () => {
    setPackageType(null)
    setSimStatus(null)
    setShowPackages(false)
    setProducts([])
    setBundleCategories([])
    setSelectedBundleCategory(null)
    setSelectedPackage(null)
    setSimPackageProductId(null)
    setError(null)
  }

  const handleBuyNow = (product: CatalogProduct) => {
    // Store selected package and navigate to dashboard with package data
    const chargeType = getPlanChargeType(product.id)
    
    console.log('[Package] Selected plan/bundle:', product)
    console.log('[Package] SIM package product ID:', simPackageProductId)
    console.log('[Package] Package type:', packageType)
    console.log('[Package] SIM status:', simStatus)
    console.log('[Package] Charge type:', chargeType)
    
    navigate('/dashboard', { 
      state: { 
        selectedPackage: {
          productId: product.id,                    // The plan/bundle product ID
          simPackageProductId: simPackageProductId, // The SIM package product ID (7029225P, 7025225P, 7023225P)
          name: product.name,
          price: product.price,
          packageType: packageType,                 // 'contract' or 'prepaid'
          simStatus: simStatus,                     // 'has-sim' or 'needs-sim'
          planChargeType: chargeType,               // 'once-off' or 'monthly'
          features: {
            mobileData: product.description,
          }
        }
      } 
    })
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />
      <main className="p-6 max-w-7xl mx-auto">
        <ChoosePackageModal 
          open={modalOpen} 
          onClose={() => setModalOpen(false)}
          selectedPackage={selectedPackage}
        />
        <section className="relative bg-neutral-900">
          <div className="mx-auto max-w-6xl px-2 sm:px-6 pt-2 sm:pt-6">
            <div className="flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Packages
            </div>
            <h2 className="mt-3 text-center font-grotesque font-extrabold text-white text-[28px] sm:text-[40px] md:text-[48px] leading-[1.05]">
              {!packageType 
                ? 'Choose your package type' 
                : packageType === 'prepaid' && !simStatus 
                ? 'Do you have a SIM?' 
                : simStatus === 'needs-sim' && !selectedBundleCategory
                ? 'Choose your bundle type'
                : 'Your packages'}
            </h2>
            <p className="mt-2 text-center text-neutral-400">
              {!packageType 
                ? 'Select between contract or prepaid options' 
                : packageType === 'prepaid' && !simStatus 
                ? 'Let us know if you already have a SIM card' 
                : simStatus === 'needs-sim' && !selectedBundleCategory
                ? 'Select the type of bundle you need'
                : `Showing ${selectedBundleCategory || packageType} packages`}
            </p>
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
              {/* Step 1: Choose Package Type */}
              {!packageType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  <button
                    onClick={() => handlePackageTypeSelect('contract')}
                    className="group rounded-2xl p-8 bg-[#5BA0FF] hover:bg-[#4A8FEE] shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.7)] transition-all min-h-[280px] flex flex-col items-center justify-center text-center"
                  >
                    <div className="size-16 rounded-full bg-white/20 grid place-items-center mb-4">
                      <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-neutral-900 font-extrabold text-3xl mb-3">Contract</h3>
                    <p className="text-neutral-900/80 text-lg">Long-term plans with SIM delivery</p>
                  </button>

                  <button
                    onClick={() => handlePackageTypeSelect('prepaid')}
                    className="group rounded-2xl p-8 bg-[#B8FF5B] hover:bg-[#A7EE4A] shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.7)] transition-all min-h-[280px] flex flex-col items-center justify-center text-center"
                  >
                    <div className="size-16 rounded-full bg-white/20 grid place-items-center mb-4">
                      <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-neutral-900 font-extrabold text-3xl mb-3">Prepaid</h3>
                    <p className="text-neutral-900/80 text-lg">Pay as you go options</p>
                  </button>
                </div>
              )}

              {/* Step 2: SIM Status (only for prepaid) */}
              {packageType === 'prepaid' && !simStatus && !selectedBundleCategory && (
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={handleReset}
                    className="mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => handleSimStatusSelect('has-sim')}
                      className="group rounded-2xl p-8 bg-[#D8B0FF] hover:bg-[#C79FEE] shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.7)] transition-all min-h-[280px] flex flex-col items-center justify-center text-center"
                    >
                      <div className="size-16 rounded-full bg-white/20 grid place-items-center mb-4">
                        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="text-neutral-900 font-extrabold text-3xl mb-3">I have a SIM</h3>
                      <p className="text-neutral-900/80 text-lg">SIM card already in hand</p>
                    </button>

                    <button
                      onClick={() => handleSimStatusSelect('needs-sim')}
                      className="group rounded-2xl p-8 bg-[#FF9B5B] hover:bg-[#EE8A4A] shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.7)] transition-all min-h-[280px] flex flex-col items-center justify-center text-center"
                    >
                      <div className="size-16 rounded-full bg-white/20 grid place-items-center mb-4">
                        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <h3 className="text-neutral-900 font-extrabold text-3xl mb-3">Need a SIM</h3>
                      <p className="text-neutral-900/80 text-lg">SIM will be delivered to you</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Bundle Category Selection */}
              {simStatus && !selectedBundleCategory && (
                <div className="max-w-6xl mx-auto">
                  <button
                    onClick={handleBackFromBundleCategories}
                    className="mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  
                  {loading && (
                    <div className="text-center py-12 text-neutral-400">Loading bundle categories...</div>
                  )}
                  
                  {error && (
                    <div className="text-center py-12 text-red-400">{error}</div>
                  )}
                  
                  {!loading && !error && bundleCategories.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bundleCategories.map((category, idx) => {
                        const colors = [
                          'bg-[#5BA0FF] hover:bg-[#4A8FEE]',
                          'bg-[#B8FF5B] hover:bg-[#A7EE4A]',
                          'bg-[#D8B0FF] hover:bg-[#C79FEE]',
                          'bg-[#FF9B5B] hover:bg-[#EE8A4A]',
                          'bg-[#FF5B8D] hover:bg-[#EE4A7C]',
                          'bg-[#5BFFD8] hover:bg-[#4AEEC7]',
                        ]
                        const colorClass = colors[idx % colors.length]
                        
                        // Icon selection based on bundle type
                        const getIcon = () => {
                          if (category.id.includes('combo')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            )
                          } else if (category.id.includes('data')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )
                          } else if (category.id.includes('voice')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                            )
                          } else if (category.id.includes('sms')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                            )
                          } else if (category.id.includes('whatsapp')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                              </svg>
                            )
                          } else if (category.id.includes('flexible') || category.id.includes('monthly')) {
                            return (
                              <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )
                          }
                          return (
                            <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          )
                        }
                        
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleBundleCategorySelect(category.id)}
                            className={`group rounded-2xl p-8 ${colorClass} shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] hover:shadow-[12px_12px_0_0_rgba(0,0,0,0.7)] transition-all min-h-[240px] flex flex-col items-center justify-center text-center`}
                          >
                            <div className="size-16 rounded-full bg-white/20 grid place-items-center mb-4 group-hover:scale-110 transition-transform">
                              {getIcon()}
                            </div>
                            <h3 className="text-neutral-900 font-extrabold text-2xl mb-2">{category.name}</h3>
                            <div className="mt-2 px-4 py-1.5 rounded-full bg-neutral-900/10 backdrop-blur-sm">
                              <p className="text-neutral-900 font-semibold text-sm">
                                {category.productCount} {category.productCount === 1 ? 'option' : 'options'}
                              </p>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Show Packages */}
              {showPackages && (
                <>
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={handleBackFromPackages}
                      className="px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to bundles
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 rounded-lg bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors"
                    >
                      Start over
                    </button>
                  </div>

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
                      {getPlanChargeType(p.id) === 'monthly' && (
                        <span className="ml-auto bg-neutral-900 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Monthly
                        </span>
                      )}
                      {getPlanChargeType(p.id) === 'once-off' && (
                        <span className="ml-auto bg-white text-neutral-900 text-xs px-2 py-1 rounded-full font-semibold">
                          Once-off
                        </span>
                      )}
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
                        <div>
                          <span className="text-neutral-900 font-bold text-lg">R{p.price.toFixed(2)}</span>
                          <span className="text-neutral-900/70 text-sm ml-1">
                            {getPlanChargeType(p.id) === 'monthly' ? '/mo' : ''}
                          </span>
                        </div>
                        <button onClick={() => handleBuyNow(p)} className="inline-block w-28 bg-white text-neutral-900 text-center rounded-lg py-2 font-semibold hover:bg-neutral-100 transition-colors">
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
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="text-white font-bold text-lg">{p.name}</h4>
                                {getPlanChargeType(p.id) === 'monthly' ? (
                                  <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                    Monthly
                                  </span>
                                ) : (
                                  <span className="bg-lime-400 text-neutral-900 text-xs px-2 py-1 rounded-full font-semibold">
                                    Once-off
                                  </span>
                                )}
                              </div>
                              <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{p.description}</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-white font-bold">R{p.price.toFixed(2)}</span>
                                  <span className="text-neutral-400 text-sm ml-1">
                                    {getPlanChargeType(p.id) === 'monthly' ? '/mo' : ''}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleBuyNow(p)}
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
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}


