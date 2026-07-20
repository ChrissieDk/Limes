import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { catalogService } from '../../catalog/services/catalogService'
import { inventoryService } from '../../inventory/services/inventoryService'
import { log } from '../../../lib/sentry-logger'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'
import type { PlanAllocation } from '../components/PlanBuilder'
import type { EnrichedComboPackage } from '../../catalog/utils/packageEnricher'
import { enrichComboPackages } from '../../catalog/utils/packageEnricher'

export type PackageType = 'contract' | 'prepaid' | null
export type SimStatus = 'has-sim' | 'needs-sim' | null

// Product ID mapping based on API responses
// CRITICAL: SA = SIM in hand, SOA = Need SIM delivered
export const PRODUCT_IDS = {
  PREPAID_SA: '7029225P',
  CONTRACT_SA: '7027225P',
  PREPAID_SOA: '7025225P',
  CONTRACT_SOA: '7023225P',
  STAFF_SOA: '7024225P',
} as const

export interface PackageSelectionState {
  products: CatalogProduct[]
  loading: boolean
  error: string | null
  packageType: PackageType
  simStatus: SimStatus
  bundleCategories: CatalogCategoryNode[]
  selectedBundleCategory: string | null
  showPackages: boolean
  showPlanBuilder: boolean
  planAllocation: PlanAllocation | null
  contractFlowType: 'dynamic' | 'combo' | null
  comboBundles: EnrichedComboPackage[]
  simPackageProductId: string | null
  iccid: string
  iccidConfirmed: boolean
  iccidSubmitLoading: boolean
  iccidError: string | null
}

export interface PackageSelectionActions {
  handlePackageTypeSelect: (type: PackageType) => void
  handleSimStatusSelect: (status: SimStatus) => void
  handleIccidSubmit: () => Promise<void>
  handleBundleCategorySelect: (categoryId: string) => void
  handleBackFromBundleCategories: () => void
  handleBackFromPackages: () => void
  handleBackFromPlanBuilder: () => void
  handleBackFromIccidInput: () => void
  handlePlanContinue: (allocation: PlanAllocation) => void
  handleReset: () => void
  handleContractFlowTypeSelect: (flowType: 'dynamic' | 'combo') => void
  handleBackFromContractFlowChoice: () => void
  handleBackFromComboBundles: () => void
  handleComboBundleSelect: (product: EnrichedComboPackage) => void
  handleBuyNow: (product: CatalogProduct) => void
  setIccid: (v: string) => void
  setIccidError: (v: string | null) => void
}

export function usePackageSelection(): PackageSelectionState & PackageSelectionActions {
  const navigate = useNavigate()
  const location = useLocation()

  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [packageType, setPackageType] = useState<PackageType>(null)
  const [simStatus, setSimStatus] = useState<SimStatus>(null)
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedBundleCategory, setSelectedBundleCategory] = useState<string | null>(null)
  const [showPackages, setShowPackages] = useState(false)
  const [showPlanBuilder, setShowPlanBuilder] = useState(false)
  const [planAllocation, setPlanAllocation] = useState<PlanAllocation | null>(null)
  const [contractFlowType, setContractFlowType] = useState<'dynamic' | 'combo' | null>(null)
  const [comboBundles, setComboBundles] = useState<EnrichedComboPackage[]>([])
  const [simPackageProductId, setSimPackageProductId] = useState<string | null>(null)
  const [iccid, setIccidState] = useState('')
  const [iccidConfirmed, setIccidConfirmed] = useState(false)
  const [iccidSubmitLoading, setIccidSubmitLoading] = useState(false)
  const [iccidError, setIccidError] = useState<string | null>(null)

  const assignToMsisdn = (location.state as Record<string, unknown>)?.assignToMsisdn as string | undefined
  const incomingPackageType = (location.state as Record<string, unknown>)?.packageType as 'contract' | 'prepaid' | undefined
  const incomingSimPackageProductId = (location.state as Record<string, unknown>)?.simPackageProductId as string | undefined

  const assignModeInitDone = useRef(false)

  useEffect(() => {
    if (assignModeInitDone.current) return
    assignModeInitDone.current = true

    if (assignToMsisdn && incomingPackageType) {
      setPackageType(incomingPackageType)
      setSimStatus('has-sim')
      setSimPackageProductId(incomingSimPackageProductId || null)
      setIccidConfirmed(true)
      window.history.replaceState({}, document.title)
    }
  }, [assignToMsisdn, incomingPackageType, incomingSimPackageProductId])

  const resetFlow = () => {
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
    setIccidError(null)
    setContractFlowType(null)
    setComboBundles([])
  }

  // Handle post-SIM-status flow
  useEffect(() => {
    if (simStatus === 'needs-sim' || (simStatus === 'has-sim' && iccidConfirmed)) {
      let simPkgId: string | null = null
      if (packageType === 'contract') {
        simPkgId = simStatus === 'has-sim' ? PRODUCT_IDS.CONTRACT_SA : PRODUCT_IDS.CONTRACT_SOA
        if (contractFlowType === 'dynamic') {
          setShowPlanBuilder(true)
        } else if (contractFlowType === 'combo') {
          fetchComboBundles()
        }
      } else if (packageType === 'prepaid') {
        simPkgId = simStatus === 'has-sim' ? PRODUCT_IDS.PREPAID_SA : PRODUCT_IDS.PREPAID_SOA
        fetchBundleCategoriesForPrepaid()
      }
      setSimPackageProductId(simPkgId)
    }
  }, [simStatus, iccidConfirmed, packageType, contractFlowType])

  const fetchBundleCategoriesForPrepaid = async () => {
    try {
      setLoading(true)
      setError(null)
      const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })
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
        const filteredCategories = onceOffTopUp.children.filter(
          (category) =>
            !category.name?.toUpperCase().includes('FWA') &&
            !category.id?.toUpperCase().includes('FWA') &&
            !category.name?.toUpperCase().includes('AIRTIME') &&
            !category.id?.toUpperCase().includes('AIRTIME')
        )
        setBundleCategories(filteredCategories)
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

  const fetchComboBundles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await catalogService.searchCategoryProducts('m2m_combo', {
        page: 1,
        limit: 100,
      })
      const enrichedBundles = enrichComboPackages(response.data)
      setComboBundles(enrichedBundles)
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
          limit: 100,
        })
        const filteredProducts = response.data.filter(
          (product) =>
            !product.name?.toUpperCase().includes('FWA') &&
            !product.description?.toUpperCase().includes('FWA')
        )
        setProducts(filteredProducts)
      } catch (err) {
        setError('Failed to load bundles. Please try again later.')
        console.error('Error fetching packages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [selectedBundleCategory, packageType])

  const getPlanChargeType = (productId: string): 'once-off' | 'monthly' => {
    const monthlyPlanIds = ['40021', '40022']
    if (monthlyPlanIds.includes(productId)) {
      return 'monthly'
    }
    return 'once-off'
  }

  const handlePackageTypeSelect = (type: PackageType) => {
    setPackageType(type)
    resetFlow()
    log.info('package_type_selected', { package_type: type || 'null' })
  }

  const handleSimStatusSelect = (status: SimStatus) => {
    setSimStatus(status)
    setSelectedBundleCategory(null)
    setShowPackages(false)
    setProducts([])
    setBundleCategories([])
    setSimPackageProductId(null)
    setIccidConfirmed(false)
    log.info('sim_status_selected', { sim_status: status || 'null', package_type: packageType || 'null' })
  }

  const handleIccidSubmit = async () => {
    if (iccid.trim().length < 15) {
      setIccidError('Please enter a valid ICCID (found on the back of your SIM card)')
      log.warn('iccid_validation_failed', { reason: 'too_short', length: iccid.trim().length })
      return
    }
    setIccidError(null)
    setIccidSubmitLoading(true)
    try {
      const result = await inventoryService.checkSim(iccid)
      if (!result.ok) {
        setIccidError(result.message)
        log.warn('iccid_check_failed', { reason: result.message })
        return
      }
      setIccidConfirmed(true)
      log.info('iccid_confirmed', { sim_status: simStatus || 'null' })
    } finally {
      setIccidSubmitLoading(false)
    }
  }

  const handleBundleCategorySelect = (categoryId: string) => {
    setSelectedBundleCategory(categoryId)
    setShowPackages(true)
    log.info('bundle_category_selected', { category_id: categoryId, package_type: packageType || 'null' })
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
    setIccidError(null)
  }

  const handlePlanContinue = (allocation: PlanAllocation) => {
    setPlanAllocation(allocation)
    const totalPriceInRands = allocation.data + allocation.airtime + allocation.sms + allocation.voice + allocation.whatsapp
    const totalPriceInCents = totalPriceInRands * 100
    log.info('custom_plan_built', {
      package_type: 'contract',
      plan_charge_type: 'monthly',
      total_price_rands: totalPriceInRands,
      total_price_cents: totalPriceInCents,
      data_allocation: allocation.data,
      airtime_allocation: allocation.airtime,
      voice_allocation: allocation.voice,
      sms_allocation: allocation.sms,
      whatsapp_allocation: allocation.whatsapp,
      sim_status: simStatus || 'null',
    })
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: 'dynamic-plan',
          simPackageProductId: simPackageProductId,
          name: 'Custom Subscription',
          price: totalPriceInRands,
          priceInCents: totalPriceInCents,
          packageType: 'contract',
          simStatus: simStatus,
          planChargeType: 'monthly',
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          isDynamicPlan: true,
          planAllocation: allocation,
          features: {
            description: [
              allocation.data > 0 && `Data: R${allocation.data}`,
              allocation.airtime > 0 && `Airtime: R${allocation.airtime}`,
              allocation.sms > 0 && `SMS: R${allocation.sms}`,
              allocation.voice > 0 && `Voice: R${allocation.voice}`,
              allocation.whatsapp > 0 && `WhatsApp: R${allocation.whatsapp}`,
            ].filter(Boolean).join(', ') || 'Custom subscription',
          },
          assignToMsisdn,
        },
      },
    })
  }

  const handleReset = () => {
    setPackageType(null)
    resetFlow()
    setError(null)
  }

  const handleContractFlowTypeSelect = (flowType: 'dynamic' | 'combo') => {
    setContractFlowType(flowType)
    log.info('contract_flow_type_selected', { flow_type: flowType, package_type: packageType || 'null' })
  }

  const handleBackFromContractFlowChoice = () => {
    setContractFlowType(null)
    setComboBundles([])
    setPackageType(null)
  }

  const handleBackFromComboBundles = () => {
    if (simStatus === 'has-sim') {
      setIccidConfirmed(false)
    } else {
      setSimStatus(null)
    }
    setComboBundles([])
  }

  const handleComboBundleSelect = (product: EnrichedComboPackage) => {
    log.info('combo_bundle_selected', {
      product_id: product.id,
      product_name: product.name,
      price_rands: product.actualPrice,
      price_cents: product.actualPriceCents,
      package_type: 'contract',
      sim_status: simStatus || 'null',
    })
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: product.id,
          simPackageProductId: simPackageProductId,
          name: product.name,
          price: product.actualPrice,
          priceInCents: product.actualPriceCents,
          packageType: 'contract',
          simStatus: simStatus,
          planChargeType: 'monthly',
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          isComboBundle: true,
          comboDetails: product.comboDetails,
          features: {
            mobileData: product.description,
          },
          assignToMsisdn,
        },
      },
    })
  }

  const handleBuyNow = (product: CatalogProduct) => {
    const chargeType = getPlanChargeType(product.id)
    log.info('prepaid_package_selected', {
      product_id: product.id,
      product_name: product.name,
      price_rands: product.price,
      price_cents: product.price * 100,
      package_type: 'prepaid',
      plan_charge_type: chargeType,
      sim_status: simStatus || 'null',
    })
    navigate('/dashboard', {
      state: {
        selectedPackage: {
          productId: product.id,
          simPackageProductId: simPackageProductId,
          name: product.name,
          price: product.price,
          priceInCents: product.price * 100,
          packageType: 'prepaid',
          simStatus: simStatus,
          planChargeType: chargeType,
          iccid: simStatus === 'has-sim' ? iccid : undefined,
          features: {
            mobileData: product.description,
          },
          assignToMsisdn,
        },
      },
    })
  }

  const setIccid = (v: string) => {
    setIccidState(v)
    setIccidError(null)
  }

  return {
    products,
    loading,
    error,
    packageType,
    simStatus,
    bundleCategories,
    selectedBundleCategory,
    showPackages,
    showPlanBuilder,
    planAllocation,
    contractFlowType,
    comboBundles,
    simPackageProductId,
    iccid,
    iccidConfirmed,
    iccidSubmitLoading,
    iccidError,
    handlePackageTypeSelect,
    handleSimStatusSelect,
    handleIccidSubmit,
    handleBundleCategorySelect,
    handleBackFromBundleCategories,
    handleBackFromPackages,
    handleBackFromPlanBuilder,
    handleBackFromIccidInput,
    handlePlanContinue,
    handleReset,
    handleContractFlowTypeSelect,
    handleBackFromContractFlowChoice,
    handleBackFromComboBundles,
    handleComboBundleSelect,
    handleBuyNow,
    setIccid,
    setIccidError,
  }
}
