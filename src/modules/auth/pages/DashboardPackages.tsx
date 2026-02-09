import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar'
import Footer from '../components/Footer'
import PlanBuilder from '../components/PlanBuilder'
import { catalogService } from '../../catalog/services/catalogService'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'
import { BundleCategorySkeleton, PackageCardSkeleton } from '../components/dashboard/PackageSkeletonLoaders.tsx'
import { enrichComboPackages, type EnrichedComboPackage } from '../../catalog/utils/packageEnricher'

type PackageType = 'contract' | 'prepaid' | null
type SimStatus = 'has-sim' | 'needs-sim' | null

// Product ID mapping based on API responses
// CRITICAL: SA = SIM in hand (already have SIM)
//           SOA = Need SIM delivered (don't have SIM yet)
const PRODUCT_IDS = {
  // SA = SIM Already in hand (I have a SIM)
  PREPAID_SA: '7029225P',      // Prepaid - SIM in hand → Mobile Prepaid Package
  CONTRACT_SA: '7027225P',     // Contract - SIM in hand → Mobile Contract Package
  // SOA = SIM On Arrival (Need a SIM delivered)
  PREPAID_SOA: '7025225P',     // Prepaid - Need SIM → Mobile Prepaid Package
  CONTRACT_SOA: '7023225P',    // Contract - Need SIM → Mobile Contract Package
  STAFF_SOA: '7024225P',       // Staff - Need SIM → Mobile Staff Package
} as const

export default function DashboardPackages() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // New selection states
  const [packageType, setPackageType] = useState<PackageType>(null)
  const [simStatus, setSimStatus] = useState<SimStatus>(null)
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedBundleCategory, setSelectedBundleCategory] = useState<string | null>(null)
  const [showPackages, setShowPackages] = useState(false)
  
  // Plan builder for CONTRACT only
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [planAllocation, setPlanAllocation] = useState<{
    data: number
    voice: number
    sms: number
    whatsapp: number
  } | null>(null)
  
  // NEW: Contract flow type - dynamic (build your own) or combo (bundles)
  const [contractFlowType, setContractFlowType] = useState<'dynamic' | 'combo' | null>(null)
  const [comboBundles, setComboBundles] = useState<EnrichedComboPackage[]>([])
  
  // Track the actual SIM package product ID (the parent product from SA/SOA categories)
  const [simPackageProductId, setSimPackageProductId] = useState<string | null>(null)
  
  // ICCID for has-sim flow ONLY
  const [iccid, setIccid] = useState<string>('')
  const [iccidConfirmed, setIccidConfirmed] = useState(false)

  // (UI only) Removed hover glow backdrop effect

  // Handle post-SIM-status flow: Plan builder for CONTRACT, Bundle categories for PREPAID
  useEffect(() => {
    if (simStatus === 'needs-sim' || (simStatus === 'has-sim' && iccidConfirmed)) {
      // Determine SIM package product ID
      let simPkgId = null
      if (packageType === 'contract') {
        simPkgId = simStatus === 'has-sim' ? PRODUCT_IDS.CONTRACT_SA : PRODUCT_IDS.CONTRACT_SOA
        // For CONTRACT: Check which flow type was selected
        if (contractFlowType === 'dynamic') {
          // Build Your Own flow - Show plan builder
          setShowPlanBuilder(true)

        } else if (contractFlowType === 'combo') {
          // Combo Bundles flow - Fetch m2m_combo products
          fetchComboBundles()
        }
      } else if (packageType === 'prepaid') {
        simPkgId = simStatus === 'has-sim' ? PRODUCT_IDS.PREPAID_SA : PRODUCT_IDS.PREPAID_SOA
        // For PREPAID: Fetch bundle categories
        fetchBundleCategoriesForPrepaid()
      }
      setSimPackageProductId(simPkgId)
    }
  }, [simStatus, iccidConfirmed, packageType, contractFlowType])

  // Fetch bundle categories for PREPAID only
  const fetchBundleCategoriesForPrepaid = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })
        console.log('[Catalog] Full category tree:', tree)
        
        const channel = tree.find((node) => node.id === 'channels')
        if (!channel) {
          setError('Channel category not found')
          console.error('[Catalog] Channel node not found in tree')
          return
        }
        
      const onceOffTopUp = channel.children?.find((node) => node.id === 'once_off_top_up')
      if (!onceOffTopUp) {
        setError('Top-up category not found')
        console.error('[Catalog] once_off_top_up node not found under channel')
          return
        }
        
      if (onceOffTopUp.children && onceOffTopUp.children.length > 0) {
        // Filter out FWA categories
        const filteredCategories = onceOffTopUp.children.filter(category => 
          !category.name?.toUpperCase().includes('FWA') && 
          !category.id?.toUpperCase().includes('FWA')
        )
        setBundleCategories(filteredCategories)
        console.log('[Catalog] Bundle categories for prepaid:', filteredCategories)
        console.log('[Catalog] Filtered out FWA categories')
        } else {
          setError('No bundle categories found')
        console.error('[Catalog] No children found under once_off_top_up')
        }
      } catch (err) {
        setError('Failed to load bundle categories. Please try again later.')
        console.error('Error fetching bundle categories:', err)
      } finally {
        setLoading(false)
      }
    }

  // NEW: Fetch combo bundles for CONTRACT combo flow
  const fetchComboBundles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('[Catalog] Fetching m2m_combo bundles...')
      const response = await catalogService.searchCategoryProducts('m2m_combo', { 
        page: 1, 
        limit: 100 
      })
      
      // Enrich packages with actual benefits and pricing
      const enrichedBundles = enrichComboPackages(response.data)
      setComboBundles(enrichedBundles)
      
      console.log('[Catalog] Fetched m2m_combo bundles:', response)
      console.log('[Catalog] Enriched bundles:', enrichedBundles)
      console.log(`[Catalog] Total bundles: ${enrichedBundles.length}`)
    } catch (err) {
      setError('Failed to load combo bundles. Please try again later.')
      console.error('Error fetching combo bundles:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch products from selected bundle category (PREPAID only)
  useEffect(() => {
    if (!selectedBundleCategory || packageType !== 'prepaid') return
    
    const fetchPackages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await catalogService.searchCategoryProducts(selectedBundleCategory, { 
          page: 1, 
          limit: 100 
        })
        
        // Filter out FWA products
        const filteredProducts = response.data.filter(product => 
          !product.name?.toUpperCase().includes('FWA') && 
          !product.description?.toUpperCase().includes('FWA')
        )
        
        setProducts(filteredProducts)
        console.log(`[Catalog] Fetched products from ${selectedBundleCategory}:`, response)
        console.log(`[Catalog] Filtered out ${response.data.length - filteredProducts.length} FWA products`)
      } catch (err) {
        setError('Failed to load packages. Please try again later.')
        console.error('Error fetching packages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPackages()
  }, [selectedBundleCategory, packageType])

  // Show all packages for the selected bundle category (UI decision)

  const getPlanChargeType = (productId: string): 'once-off' | 'monthly' => {
    const monthlyPlanIds = ['40021', '40022']
    if (monthlyPlanIds.includes(productId)) {
      return 'monthly'
    }
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
    setShowPlanBuilder(false)
    // Reset new contract flow states
    setContractFlowType(null)
    setComboBundles([])
  }

  const handleSimStatusSelect = (status: SimStatus) => {
    // Log the product ID that will be used for this selection
    let expectedProductId = ''
    if (packageType === 'contract') {
      expectedProductId = status === 'has-sim' ? PRODUCT_IDS.CONTRACT_SA : PRODUCT_IDS.CONTRACT_SOA
      console.log('======================================')
      console.log('[SIM Selection] CONTRACT flow selected')
      console.log(`[SIM Selection] Status: ${status === 'has-sim' ? 'I have a SIM' : 'Need a SIM'}`)
      console.log(`[SIM Selection] Product ID: ${expectedProductId}`)
      console.log('======================================')
    } else if (packageType === 'prepaid') {
      expectedProductId = status === 'has-sim' ? PRODUCT_IDS.PREPAID_SA : PRODUCT_IDS.PREPAID_SOA
      console.log('======================================')
      console.log('[SIM Selection] PREPAID flow selected')
      console.log(`[SIM Selection] Status: ${status === 'has-sim' ? 'I have a SIM' : 'Need a SIM'}`)
      console.log(`[SIM Selection] Product ID: ${expectedProductId}`)
      console.log('======================================')
    }
    
    setSimStatus(status)
    setSelectedBundleCategory(null)
    setShowPackages(false)
    setProducts([])
    setBundleCategories([])
    setSimPackageProductId(null)
    setIccidConfirmed(false)
  }
  
  const handleIccidSubmit = () => {
    if (iccid.trim().length < 15) {
      alert('Please enter a valid ICCID (found on the back of your SIM card)')
      return
    }
    setIccidConfirmed(true)
  }

  const handleBundleCategorySelect = (categoryId: string) => {
    setSelectedBundleCategory(categoryId)
    setShowPackages(true)
  }

  // Helper to get category styling and icon
  const getCategoryStyle = (categoryId: string) => {
    const styles: Record<string, { bg: string, hover: string, icon: ReactNode }> = {
      'data': {
        bg: 'bg-[#ABFF63]',
        hover: 'hover:brightness-95',
        icon: (
          <svg className="w-10 h-10 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      'voice': {
        bg: 'bg-pink-300',
        hover: 'hover:brightness-95',
        icon: (
          <svg className="w-10 h-10 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )
      },
      'sms': {
        bg: 'bg-[#629BFC]',
        hover: 'hover:brightness-95',
        icon: (
          <svg className="w-10 h-10 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      },
      'whatsapp': {
        bg: 'bg-[#5BFFD8]',
        hover: 'hover:brightness-95',
        icon: (
          <svg className="w-10 h-10 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        )
      },
      'airtime': {
        bg: 'bg-[#CDA7FC]',
        hover: 'hover:brightness-95',
        icon: (
          <svg className="w-10 h-10 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'data_fwa': {
        bg: 'bg-[#4A90E2]',
        hover: 'hover:bg-[#3A80D2]',
        icon: (
          <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        )
      }
    }

    // Default combo bundles style
    return styles[categoryId] || {
      bg: 'bg-[#7B9FF5]',
      hover: 'hover:bg-[#6B8FE5]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  }

  const handleBackFromBundleCategories = () => {
    if (simStatus === 'has-sim') {
      setIccidConfirmed(false)
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

  const handleBackFromPlanBuilder = () => {
    // Go back to ICCID input if has-sim, otherwise to SIM status selection
    if (simStatus === 'has-sim') {
      setIccidConfirmed(false)
      setShowPlanBuilder(false)
    } else {
      setSimStatus(null)
      setShowPlanBuilder(false)
    }
    setPlanAllocation(null)
  }
  
  const handleBackFromIccidInput = () => {
    setSimStatus(null)
    setIccid('')
    setIccidConfirmed(false)
  }

  const handlePlanContinue = (allocation: { data: number; voice: number; sms: number; whatsapp: number }) => {
    setPlanAllocation(allocation)
    console.log('[PlanBuilder] Plan allocation:', allocation)
    
    // Calculate total price
    const totalPriceInRands = allocation.data + allocation.voice + allocation.sms + allocation.whatsapp
    const totalPriceInCents = totalPriceInRands * 100 // For Paystack payment
    
    // Navigate to dashboard with contract plan details
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: 'dynamic-plan',
          simPackageProductId: simPackageProductId,
          name: 'Custom Plan',
          price: totalPriceInRands, // Display price in Rands
          priceInCents: totalPriceInCents, // For Paystack payment
          packageType: 'contract',
          simStatus: simStatus,
          planChargeType: 'monthly',
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          isDynamicPlan: true,
          planAllocation: allocation, // { data: R, voice: R, sms: R, whatsapp: R }
          features: {
            description: `Data: R${allocation.data}, Voice: R${allocation.voice}, SMS: R${allocation.sms}, WhatsApp: R${allocation.whatsapp}`
          }
        }
      }
    })
  }

  const handleReset = () => {
    setPackageType(null)
    setSimStatus(null)
    setShowPackages(false)
    setProducts([])
    setBundleCategories([])
    setSelectedBundleCategory(null)
    setSimPackageProductId(null)
    setShowPlanBuilder(false)
    setPlanAllocation(null)
    setIccid('')
    setIccidConfirmed(false)
    setError(null)
    // Reset new contract flow states
    setContractFlowType(null)
    setComboBundles([])
  }

  // NEW: Handle contract flow type selection (Build Your Own vs Bundles)
  const handleContractFlowTypeSelect = (flowType: 'dynamic' | 'combo') => {
    setContractFlowType(flowType)
    console.log(`[Contract Flow] Selected: ${flowType === 'dynamic' ? 'Build Your Own' : 'Combo Bundles'}`)
  }

  // NEW: Handle back from contract flow choice screen
  const handleBackFromContractFlowChoice = () => {
    setContractFlowType(null)
    setComboBundles([])
    setPackageType(null)
  }

  // NEW: Handle back from combo bundles display
  const handleBackFromComboBundles = () => {
    if (simStatus === 'has-sim') {
      setIccidConfirmed(false)
    } else {
      setSimStatus(null)
    }
    setComboBundles([])
  }

  // NEW: Handle combo bundle selection
  const handleComboBundleSelect = (product: EnrichedComboPackage) => {
    
    // Navigate to dashboard with contract combo bundle details
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: product.id, // Keep original product ID for backend
          simPackageProductId: simPackageProductId,
          name: product.name,
          price: product.actualPrice, // Use actual price in Rands
          priceInCents: product.actualPriceCents, // Use actual price in cents for Paystack
          packageType: 'contract',
          simStatus: simStatus,
          planChargeType: 'monthly', // Combo bundles are monthly subscriptions
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          isComboBundle: true, // Flag to identify combo bundle vs dynamic plan
          comboDetails: product.comboDetails, // Include full combo details
          features: {
            mobileData: product.description
          }
        }
      }
    })
  }

  const handleBuyNow = (product: CatalogProduct) => {
    const chargeType = getPlanChargeType(product.id)
    
    // Navigate to dashboard with prepaid package details
    // Dashboard will check ricaComplete and open appropriate modal
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: product.id,
          simPackageProductId: simPackageProductId,
          name: product.name,
          price: product.price, // Display price in Rands
          priceInCents: product.price * 100, // For Paystack payment (convert to cents)
          packageType: 'prepaid',
          simStatus: simStatus,
          planChargeType: chargeType,
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          features: {
            mobileData: product.description
          }
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />
      <main className="p-6 max-w-6xl mx-auto">
        <section className="relative bg-neutral-900">
          <div className="mx-auto max-w-6xl px-2 sm:px-6 pt-2 sm:pt-6">
            <div className="flex items-center justify-center text-sm text-neutral-400">
              <span className="size-1.5 rounded-full bg-purple-400 mr-2" /> Packages
            </div>
            <h2 className="mt-3 text-center font-grotesque font-extrabold text-white text-4xl sm:text-[40px] md:text-[48px] leading-[1.05]">
              {!packageType 
                ? 'Choose your package type' 
                : packageType === 'contract' && !contractFlowType
                ? 'Choose your plan type'
                : packageType === 'prepaid' && !simStatus 
                ? 'Do you have a SIM?' 
                : (packageType === 'contract' && contractFlowType && !simStatus)
                ? 'Do you have a SIM?'
                : simStatus === 'has-sim' && !iccidConfirmed
                ? 'Enter your ICCID'
                : simStatus && !selectedBundleCategory && packageType === 'prepaid'
                ? 'Choose your bundle type'
                : comboBundles.length > 0
                ? 'Choose your combo bundle'
                : 'Your packages'}
            </h2>
            <p className="mt-2 text-center text-neutral-400">
              {!packageType 
                ? 'Select between contract or prepaid options' 
                : packageType === 'contract' && !contractFlowType
                ? 'Build your own plan or choose a combo bundle'
                : packageType === 'prepaid' && !simStatus 
                ? 'Let us know if you already have a SIM card' 
                : (packageType === 'contract' && contractFlowType && !simStatus)
                ? 'Let us know if you already have a SIM card'
                : simStatus === 'has-sim' && !iccidConfirmed
                ? 'Found on the back of your SIM card'
                : simStatus && !selectedBundleCategory && packageType === 'prepaid'
                ? 'Select the type of bundle you need'
                : comboBundles.length > 0
                ? `${comboBundles.length} combo bundles available`
                : `Showing ${selectedBundleCategory || packageType} packages`}
            </p>
          </div>

          <div className="mt-6">
            <div className="mx-auto max-w-5xl px-2 sm:px-6 lg:px-8 py-6 sm:py-10">
              {/* Step 1: Choose Package Type */}
              {!packageType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-4xl mx-auto">
                  <button
                    onClick={() => handlePackageTypeSelect('contract')}
                    className="group rounded-[28px] bg-[#FDDA36] shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                  >
                    <div className="mb-4">
                      <img
                        src={`${import.meta.env.BASE_URL}images/house.png`}
                        alt=""
                        aria-hidden="true"
                        className="h-11 w-11 select-none"
                      />
                    </div>
                    <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                      Contract
                    </h3>
                    <p className="mt-1.5 text-neutral-900/80 text-base md:text-lg">
                      Long-term plans with SIM delivery.
                    </p>
                    <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                      <span>I want a Contract</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handlePackageTypeSelect('prepaid')}
                    className="group rounded-[28px] bg-[#ABFF63] shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                  >
                    <div className="mb-4">
                      <img
                        src={`${import.meta.env.BASE_URL}images/zblock.png`}
                        alt=""
                        aria-hidden="true"
                        className="h-11 w-11 select-none"
                      />
                    </div>
                    <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                      Prepaid
                    </h3>
                    <p className="mt-1.5 text-neutral-900/80 text-base md:text-lg">
                      Pay-as-you-go options.
                    </p>
                    <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                      <span>I want Prepaid</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </button>
                </div>
              )}

              {/* NEW Step 1.5: Contract Flow Type Selection (CONTRACT ONLY) */}
              {packageType === 'contract' && !contractFlowType && (
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={handleBackFromContractFlowChoice}
                    className="mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => handleContractFlowTypeSelect('dynamic')}
                      className="group rounded-[28px] bg-[#F8A1D9] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img
                          src={`${import.meta.env.BASE_URL}images/house.png`}
                          alt=""
                          aria-hidden="true"
                          className="h-11 w-11 select-none"
                        />
                      </div>
                      <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                        Build your own
                      </h3>
                      <p className="mt-1.5 text-neutral-900 text-base md:text-lg inline-flex items-center gap-2">
                        <span>Customise your perfect plan</span>
                        <span aria-hidden="true">→</span>
                      </p>
                    </button>

                    <button
                      onClick={() => handleContractFlowTypeSelect('combo')}
                      className="group rounded-[28px] bg-[#629CFC] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img
                          src={`${import.meta.env.BASE_URL}images/zblock.png`}
                          alt=""
                          aria-hidden="true"
                          className="h-11 w-11 select-none"
                        />
                      </div>
                      <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                        Combo bundles
                      </h3>
                      <p className="mt-1.5 text-neutral-900 text-base md:text-lg inline-flex items-center gap-2">
                        <span>Choose from our bundles</span>
                        <span aria-hidden="true">→</span>
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: SIM Status (for both contract and prepaid) */}
              {((packageType === 'prepaid' && !simStatus) || (packageType === 'contract' && contractFlowType && !simStatus)) && !selectedBundleCategory && (
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => handleSimStatusSelect('has-sim')}
                      className="group rounded-[28px] bg-[#D8B0FF] hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img
                          src={`${import.meta.env.BASE_URL}images/checkmark.png`}
                          alt=""
                          aria-hidden="true"
                          className="h-11 w-11 select-none"
                        />
                      </div>
                      <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                        I have a SIM
                      </h3>
                      <p className="mt-1.5 text-neutral-900/80 text-base md:text-lg">
                        SIM card already in hand
                      </p>
                      <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                        <span>Continue</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleSimStatusSelect('needs-sim')}
                      className="group rounded-[28px] bg-pink-300 hover:brightness-95 shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all min-h-[210px] px-8 py-8 md:px-10 md:py-9 flex flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4">
                        <img
                          src={`${import.meta.env.BASE_URL}images/plan_logo.png`}
                          alt=""
                          aria-hidden="true"
                          className="h-11 w-11 select-none"
                        />
                      </div>
                      <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                        I need a SIM
                      </h3>
                      <p className="mt-1.5 text-neutral-900/80 text-base md:text-lg">
                        SIM will be delivered to you
                      </p>
                      <div className="mt-3 text-neutral-900 font-semibold inline-flex items-center gap-2">
                        <span>Continue</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2.5: ICCID Input (ONLY for has-sim flow) */}
              {simStatus === 'has-sim' && !iccidConfirmed && (
                <div className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto">
                  <button
                    onClick={handleBackFromIccidInput}
                    className="mb-6 px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>

                  <div className="rounded-[28px] p-7 md:p-10 bg-[#629BFC] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={`${import.meta.env.BASE_URL}images/star.png`}
                        alt=""
                        className="h-10 w-10 select-none"
                      />
                    </div>

                    <h3 className="text-neutral-900 font-semibold text-[34px] md:text-[40px] mb-2 text-center leading-[1.05]">
                      Enter your ICCID
                    </h3>
                    <p className="text-neutral-900/80 text-base md:text-lg mb-7 text-center">
                      Your ICCID is printed on the back of your SIM card
                    </p>

                    <div className="bg-white/25 rounded-2xl p-5 md:p-6 mb-7">
                      <label htmlFor="iccid" className="block text-neutral-900 font-semibold mb-2">
                        ICCID Number
                      </label>
                      <input
                        id="iccid"
                        type="text"
                        value={iccid}
                        onChange={(e) => setIccid(e.target.value)}
                        placeholder="e.g., 8927078220008762165"
                        className="w-full px-4 py-3 rounded-xl bg-white text-neutral-900 font-mono text-lg border border-black/30 focus:outline-none focus:ring-2 focus:ring-black/30"
                        maxLength={22}
                      />
                      <p className="text-neutral-900/70 text-sm mt-2">
                        Usually 19-20 digits long
                      </p>
                    </div>

                    <button
                      onClick={handleIccidSubmit}
                      disabled={iccid.trim().length < 15}
                      className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_18px_55px_rgba(0,0,0,0.25)]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Bundle Category Selection (PREPAID ONLY) */}
              {packageType === 'prepaid' && bundleCategories.length > 0 && !selectedBundleCategory && !showPackages && (
                <div className="max-w-7xl mx-auto">
                  <button
                    onClick={handleBackFromBundleCategories}
                    className="mb-6 px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                      {[1, 2, 3, 4, 5, 6].map(i => <BundleCategorySkeleton key={i} />)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                      {bundleCategories.map((category) => {
                        const style = getCategoryStyle(category.id)
                        return (
                          <button
                            key={category.id}
                            onClick={() => handleBundleCategorySelect(category.id)}
                            className={`group rounded-[28px] px-10 py-12 ${style.bg} ${style.hover} transition-all min-h-[240px] flex flex-col items-center justify-center text-center`}
                          >
                            <div className="mb-6 text-neutral-900">{style.icon}</div>
                            <h3 className="text-neutral-900 font-bold text-[30px] md:text-[34px] leading-[1.05]">
                              {category.name}
                            </h3>
                            <div className="mt-5 inline-flex items-center justify-center rounded-full bg-black/35 text-white px-5 py-2 text-sm font-semibold">
                              {category.productCount} {category.productCount === 1 ? 'option' : 'options'}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Show Packages (PREPAID ONLY) */}
              {packageType === 'prepaid' && showPackages && selectedBundleCategory && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleBackFromPackages}
                      className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to bundles
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors"
                    >
                      Start over
                    </button>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {[1, 2, 3, 4, 5, 6].map(i => <PackageCardSkeleton key={i} />)}
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400 text-lg mb-4">{error}</p>
                    <button
                        onClick={handleBackFromPackages}
                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-xl font-semibold hover:bg-lime-300 transition-colors"
                    >
                        Go Back
                    </button>
                  </div>
                  ) : products.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {products.map((pkg, idx) => {
                          // Cycle through colors for the 3-column layout
                          const colors = [
                            { bg: 'bg-[#CDA7FC]' }, // left column
                            { bg: 'bg-[#ABFF64]' }, // middle column
                            { bg: 'bg-[#F8A1D9]' }, // right column
                          ]
                          const colorScheme = colors[idx % colors.length]
                          
                          return (
                            <div
                              key={pkg.id}
                              className={`rounded-[28px] p-8 ${colorScheme.bg} shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all group relative overflow-hidden min-h-[230px] flex flex-col`}
                            >
                              <div className="text-neutral-900 font-bold text-[32px] md:text-[34px] leading-[1.05] tracking-tight">
                                {pkg.name}
                              </div>
                              <div className="mt-4 h-[2px] w-full bg-neutral-900/30" />

                              <div className="mt-6 text-neutral-900 font-bold text-[44px] md:text-[48px] leading-none tracking-tight">
                                R{pkg.price.toFixed(2)}
                              </div>

                              <div className="mt-6">
                                <button
                                  onClick={() => handleBuyNow(pkg)}
                                  className="inline-flex items-center justify-center h-10 px-6 rounded-[12px] bg-white text-neutral-900 text-sm font-semibold border border-neutral-900/50 hover:bg-neutral-50 transition-colors"
                                >
                                  Buy now
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Intentionally showing all packages; no "Show all" toggle */}
                    </>
                  ) : (
                    <div className="text-center py-12 text-neutral-400">
                      <p className="text-lg">No packages available in this category.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Plan Builder (CONTRACT ONLY - Dynamic Flow) */}
              {packageType === 'contract' && showPlanBuilder && !planAllocation && (
                <PlanBuilder
                  onContinue={handlePlanContinue}
                  onBack={handleBackFromPlanBuilder}
                />
              )}

              {/* NEW Step 3: Combo Bundles Display (CONTRACT ONLY - Combo Flow) */}
              {packageType === 'contract' && contractFlowType === 'combo' && comboBundles.length > 0 && (
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={handleBackFromComboBundles}
                      className="px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-semibold hover:bg-neutral-600 transition-colors"
                    >
                      Start over
                    </button>
                  </div>

                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {[1, 2, 3, 4, 5, 6].map(i => <PackageCardSkeleton key={i} />)}
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-400 text-lg mb-4">{error}</p>
                      <button
                        onClick={handleBackFromComboBundles}
                        className="px-6 py-3 bg-lime-400 text-neutral-900 rounded-xl font-semibold hover:bg-lime-300 transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {comboBundles.map((bundle, idx) => {
                        // Match the 3-column visual pattern from the flow
                        const colors = [
                          { bg: 'bg-[#CDA7FC]' }, // left column
                          { bg: 'bg-[#ABFF64]' }, // middle column
                          { bg: 'bg-[#F8A1D9]' }, // right column
                        ]
                        const colorScheme = colors[idx % colors.length]

                        const benefits = bundle.comboDetails?.benefits ?? []
                        const includedRows: Array<{ key: string; label: string; value: string; meta?: string }> = []

                        // Show key value-prop details in a consistent order.
                        // We intentionally keep this compact but comprehensive enough for comparison.
                        const pick = (type: typeof benefits[number]['type']) => benefits.find(b => b.type === type)

                        const standardData = pick('data')
                        const promoData = pick('promo_data')
                        const zeroRatedData = pick('zero_rated_data')
                        const whatsapp = pick('whatsapp')
                        const voice = pick('voice')
                        const sms = pick('sms')
                        const airtime = pick('gpa_credit')

                        if (standardData) {
                          includedRows.push({
                            key: 'data',
                            label: 'Data',
                            value: standardData.formattedValue,
                            meta: standardData.validity,
                          })
                        }
                        if (promoData) {
                          includedRows.push({
                            key: 'promo_data',
                            label: 'Bonus data',
                            value: promoData.formattedValue,
                            meta: promoData.validity,
                          })
                        }
                        if (zeroRatedData) {
                          includedRows.push({
                            key: 'zero_rated_data',
                            label: 'Zero-rated',
                            value: zeroRatedData.formattedValue,
                            meta: zeroRatedData.validity,
                          })
                        }
                        if (whatsapp) {
                          includedRows.push({
                            key: 'whatsapp',
                            label: 'WhatsApp',
                            value: whatsapp.formattedValue,
                            meta: whatsapp.validity,
                          })
                        }
                        if (voice) {
                          includedRows.push({
                            key: 'voice',
                            label: 'Voice',
                            value: voice.formattedValue,
                            meta: voice.validity,
                          })
                        }
                        if (sms) {
                          includedRows.push({
                            key: 'sms',
                            label: 'SMS',
                            value: sms.formattedValue,
                            meta: sms.validity,
                          })
                        }
                        if (airtime) {
                          includedRows.push({
                            key: 'gpa_credit',
                            label: 'Airtime',
                            value: airtime.formattedValue,
                            meta: airtime.validity,
                          })
                        }

                        return (
                          <div
                            key={bundle.id}
                            className={`rounded-[28px] p-8 ${colorScheme.bg} shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all group relative overflow-hidden min-h-[230px] flex flex-col`}
                          >
                            <div className="text-neutral-900 font-bold text-[24px] md:text-[26px] leading-[1.1] tracking-tight">
                              {bundle.name}
                            </div>
                            <div className="mt-4 h-[2px] w-full bg-neutral-900/30" />

                            <div className="mt-5 flex-1">
                              {includedRows.length > 0 ? (
                                <div className="space-y-1.5">
                                  {includedRows.map(row => (
                                    <div key={row.key} className="flex items-baseline justify-between gap-4">
                                      <span className="text-neutral-900/80 text-sm font-semibold whitespace-nowrap">
                                        {row.label}
                                        {row.meta ? <span className="text-neutral-900/60 font-semibold"> ({row.meta})</span> : null}
                                      </span>
                                      <span className="text-neutral-900 text-sm font-bold whitespace-nowrap">{row.value}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : bundle.comboDetails?.shortSummary ? (
                                <p className="text-neutral-900/80 text-sm font-semibold">{bundle.comboDetails.shortSummary}</p>
                              ) : null}
                            </div>

                            <div className="mt-auto pt-6">
                              <div className="text-neutral-900 font-bold text-[34px] md:text-[38px] leading-none tracking-tight">
                                R{bundle.actualPrice.toFixed(2)}
                              </div>
                              <div className="mt-5">
                                <button
                                  onClick={() => handleComboBundleSelect(bundle)}
                                  className="inline-flex items-center justify-center h-10 px-6 rounded-[12px] bg-white text-neutral-900 text-sm font-semibold border border-neutral-900/50 hover:bg-neutral-50 transition-colors"
                                >
                                  Buy now
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


