import { useEffect, useState } from 'react'
import { catalogService } from '../../catalog/services/catalogService'
import { paymentService } from '../../payment/services/paymentService'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { dynamicServicesPaymentService } from '../../payment/services/dynamicServicesPaymentService'
import { getServiceDisplayValue, convertRandsToServiceValue, getDefaultExpiryDate } from '../../payment/utils/dynamicPricing'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'
import type { ServiceType } from '../../payment/utils/dynamicPricing'
import { Loader2 } from 'lucide-react'

// Paystack Popup
declare const PaystackPop: any

type TopUpKind = 'airtime' | 'bundles'

interface TopUpModalProps {
  open: boolean
  onClose: () => void
  initialKind?: TopUpKind
  phoneNumber?: string
  phoneNumbers?: string[]
}

const renderProductList = (products: CatalogProduct[], selectedProduct: CatalogProduct | null, onSelect: (product: CatalogProduct) => void) => {
  return products.map((product) => (
    <button
      key={product.id}
      onClick={() => onSelect(product)}
      className={`w-full rounded-xl border-2 ${
        selectedProduct?.id === product.id
          ? 'border-neutral-900 bg-lime-50'
          : 'border-neutral-200 bg-white hover:border-neutral-300'
      } p-4 text-left transition-all`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-neutral-900">{product.name}</div>
          <div className="text-sm text-neutral-600 mt-1">{product.description}</div>
        </div>
        <div className="text-right ml-4">
          <div className="font-bold text-lg text-neutral-900">R{product.price.toFixed(2)}</div>
          <div className="text-xs text-neutral-500">once-off</div>
        </div>
      </div>
    </button>
  ))
}

export default function TopUpModal({ open, onClose, phoneNumber, phoneNumbers }: TopUpModalProps) {
  const [kind, setKind] = useState<TopUpKind>('bundles')
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>(phoneNumber ?? (phoneNumbers?.[0] ?? ''))
  
  // Bundle categories and products from catalog
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Price input for voice/data/sms/whatsapp (cost-based only)
  const [price, setPrice] = useState(50)
  
  // Payment states
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'card' | 'eft'>('eft')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    setSelectedPhoneNumber(phoneNumber ?? (phoneNumbers?.[0] ?? ''))
  }, [phoneNumber, phoneNumbers])

  const adjustPrice = (delta: number) => {
    setPrice((prev) => Math.max(1, Math.min(1000, prev + delta)))
  }

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      setPrice(1)
    } else {
      const numValue = parseInt(value, 10)
      setPrice(Math.max(1, Math.min(1000, numValue)))
    }
  }

  const formattedPrice = `R${price}`

  // Fetch bundle categories when modal opens and bundles tab is active
  useEffect(() => {
    if (!open || kind !== 'bundles') return
    
    const fetchBundleCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })
        console.log('[TopUp] Full category tree:', tree)
        
        const channel = tree.find((node) => node.id === 'channels')
        if (!channel) {
          setError('Channel category not found')
          console.error('[TopUp] Channel node not found in tree')
          return
        }
        
        const onceOffTopUp = channel.children?.find((node) => node.id === 'once_off_top_up')
        if (!onceOffTopUp) {
          setError('Top-up category not found')
          console.error('[TopUp] once_off_top_up node not found under channel')
          return
        }
        
        if (onceOffTopUp.children && onceOffTopUp.children.length > 0) {
          // Filter out FWA categories
          const filteredCategories = onceOffTopUp.children.filter(category => 
            !category.name?.toUpperCase().includes('FWA') && 
            !category.id?.toUpperCase().includes('FWA')
          )
          setBundleCategories(filteredCategories)
          console.log('[TopUp] Bundle categories from once_off_top_up:', filteredCategories)
          console.log('[TopUp] Filtered out FWA categories')
        } else {
          setError('No bundle categories found')
          console.error('[TopUp] No children found under once_off_top_up')
        }
      } catch (err) {
        setError('Failed to load bundle categories')
        console.error('Error fetching bundle categories:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBundleCategories()
  }, [open, kind])

  // Fetch products when category is selected
  useEffect(() => {
    if (!selectedCategory) return
    
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await catalogService.searchCategoryProducts(selectedCategory, { 
          page: 1, 
          limit: 100 
        })
        
        // Filter out FWA products
        const filteredProducts = response.data.filter(product => 
          !product.name?.toUpperCase().includes('FWA') && 
          !product.description?.toUpperCase().includes('FWA')
        )
        
        setProducts(filteredProducts)
        console.log(`[TopUp] Fetched products from ${selectedCategory}:`, response)
        console.log(`[TopUp] Filtered out ${response.data.length - filteredProducts.length} FWA products`)
      } catch (err) {
        setError('Failed to load products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  // Handle bundle purchase
  const handlePurchaseBundle = async () => {
    if (!selectedProduct || !selectedPhoneNumber) {
      setPaymentError('Please select a bundle and phone number')
      return
    }

    setIsPaymentProcessing(true)
    setPaymentError(null)

    try {
      console.log('[TopUp] Initializing payment for bundle:', selectedProduct)
      console.log('[TopUp] MSISDN:', selectedPhoneNumber)
      
      const payload = {
        productId: String(selectedProduct.id),
        msisdn: String(selectedPhoneNumber)
      }
      
      const initResponse = await paymentService.initializeTransaction(payload)

      if (!initResponse.success || !initResponse.data) {
        setPaymentError(initResponse.error || 'Failed to initialize payment')
        return
      }

      console.log('[TopUp] Transaction initialized, opening Paystack...')

      // Use Paystack Popup
      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: async (transaction: any) => {
          console.log('[TopUp] Payment successful, verifying...')
          
          try {
            // STEP 1: Verify payment
            const verificationResponse = await paymentService.verifyPayment({
              reference: transaction.reference || initResponse.data?.reference || '',
              saveCard: false, // Once-off top-up, don't save card
            })

            if (!verificationResponse.success) {
              throw new Error(verificationResponse.error || 'Payment verification failed')
            }
            console.log('[TopUp] ✓ Payment verified')
            
            // STEP 2: Create order (NO subscriber creation - already exists)
            console.log('[TopUp] Creating order...')
            const orderResponse = await subscriptionService.createOrder({
              products: [{ id: selectedProduct.id, amount: selectedProduct.price }],
              msisdn: selectedPhoneNumber
            })
            
            if (orderResponse.orderId) {
              // Order created immediately - link transaction
              console.log('[TopUp] ✓ Order created:', orderResponse.orderId)
              
              // STEP 3: Link transaction to order
              console.log('[TopUp] Linking transaction to order...')
              await paymentService.linkTransactionToOrder({
                transactionReference: transaction.reference || initResponse.data?.reference || '',
                orderId: orderResponse.orderId
              })
              console.log('[TopUp] ✓ Transaction linked')
            } else if (orderResponse.message) {
              // Order queued/pending
              console.log('[TopUp] ℹ Order pending:', orderResponse.message)
              console.log('[TopUp] Order will be created and linked when SIM activates')
            } else {
              throw new Error('Order creation failed - no orderId or message in response')
            }
            
            setPaymentSuccess(true)
            setTimeout(() => {
              setPaymentSuccess(false)
              setSelectedCategory(null)
              setSelectedProduct(null)
              onClose()
            }, 2000)
          } catch (err: any) {
            setPaymentError(err.response?.data?.message || err.message || 'Payment processing failed')
          }
        },
        onCancel: () => {
          console.log('[TopUp] Payment cancelled')
          setPaymentError(null)
        }
      })
    } catch (error: any) {
      console.error('[TopUp] Payment error:', error)
      setPaymentError(error.response?.data?.message || error.message || 'Failed to process payment')
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedProduct(null)
    setProducts([])
  }

  // Handle dynamic service purchase (Voice, Data, SMS, WhatsApp)
  const handlePurchaseDynamicService = async () => {
    if (!selectedPhoneNumber || kind === 'bundles') {
      setPaymentError('Please select a phone number')
      return
    }

    setIsPaymentProcessing(true)
    setPaymentError(null)

    try {
      const serviceType = kind.toUpperCase() as ServiceType
      const serviceValue = convertRandsToServiceValue(serviceType, price, 'prepaid')
      
      // Check if service is available for prepaid
      if (serviceValue === null) {
        setPaymentError(`${kind} service is not available for prepaid packages`)
        return
      }
      
      const expiryDate = getDefaultExpiryDate()
      const priceInCents = price * 100
      
      // Map AIRTIME to AIRTIME_ADVANCE for backend
      const definitionCode = serviceType === 'AIRTIME' ? 'AIRTIME_ADVANCE' : serviceType

      console.log('[TopUp] Initializing dynamic service payment:', {
        serviceType,
        definitionCode,
        price,
        serviceValue,
        priceInCents,
        expiryDate
      })

      const payload = {
        msisdn: String(selectedPhoneNumber),
        services: [
          {
            value: serviceValue,
            definitionCode: definitionCode as any, // Backend expects AIRTIME_ADVANCE
            expiryDate,
            priceInCents,
          },
        ],
      }

      const initResponse = await dynamicServicesPaymentService.initializePayment(payload)

      if (!initResponse.success || !initResponse.data) {
        setPaymentError(initResponse.error || 'Failed to initialize payment')
        return
      }

      console.log('[TopUp] Dynamic service transaction initialized, opening Paystack...')

      // Use Paystack Popup
      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: async (transaction: any) => {
          console.log('[TopUp] Dynamic service payment successful, verifying...')

          try {
            // STEP 1: Verify payment
            const verificationResponse = await paymentService.verifyPayment({
              reference: transaction.reference || initResponse.data?.reference || '',
              saveCard: false,
            })

            if (!verificationResponse.success) {
              throw new Error(verificationResponse.error || 'Payment verification failed')
            }
            console.log('[TopUp] ✓ Payment verified')
            
            // STEP 2: Create dynamic services (NO subscriber creation - already exists)
            console.log('[TopUp] Creating dynamic services...')
            const serviceValue = convertRandsToServiceValue(kind.toUpperCase() as ServiceType, price, 'prepaid')
            
            if (serviceValue === null) {
              throw new Error(`${kind} service is not available for prepaid packages`)
            }
            
            const definitionCode = kind.toUpperCase() === 'AIRTIME' ? 'AIRTIME_ADVANCE' : kind.toUpperCase()
            
            const servicesResponse = await subscriptionService.createDynamicServices(
              selectedPhoneNumber,
              {
                services: [{
                  value: serviceValue,
                  definitionCode: definitionCode as any,
                  expiryDate: getDefaultExpiryDate()
                }]
              }
            )
            
            const serviceIds = servicesResponse.results
              .filter(r => r.success && r.id)
              .map(r => r.id!)
            
            if (serviceIds.length === 0) {
              throw new Error('No services created')
            }
            console.log('[TopUp] ✓ Dynamic services created:', serviceIds)
            
            // STEP 3: Link transaction to services
            console.log('[TopUp] Linking transaction to services...')
            await paymentService.linkTransactionToServices({
              transactionReference: transaction.reference || initResponse.data?.reference || '',
              serviceIds: serviceIds
            })
            console.log('[TopUp] ✓ Transaction linked to services')
            
            setPaymentSuccess(true)
            setTimeout(() => {
              setPaymentSuccess(false)
              setPrice(50) // Reset to default
              onClose()
            }, 2000)
          } catch (err: any) {
            setPaymentError(err.response?.data?.message || err.message || 'Payment processing failed')
          }
        },
        onCancel: () => {
          console.log('[TopUp] Dynamic service payment cancelled')
          setPaymentError(null)
        },
      })
    } catch (error: any) {
      console.error('[TopUp] Dynamic service payment error:', error)
      setPaymentError(error.response?.data?.message || error.message || 'Failed to process payment')
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg sm:max-w-xl mx-0 sm:mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-8 rounded-lg bg-neutral-900 text-white">▣</div>
            <div>
              <div className="font-extrabold text-lg">Top-up</div>
              <div className="text-sm text-neutral-500">Enter the details below to top-up</div>
            </div>
          </div>
          <button aria-label="Close" className="size-10 grid place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 text-2xl" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5 space-y-5">
          {/* Tab Selection */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'airtime' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('airtime')}>Airtime</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'bundles' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('bundles')}>Bundles</button>
          </div>

          {/* Price Entry UI for Airtime */}
          {kind !== 'bundles' && (
            <div className="flex items-center justify-center gap-4">
              <button 
                className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100 transition-colors" 
                onClick={() => adjustPrice(-5)}
              >
                −
              </button>
              <div className="flex items-center justify-center gap-1">
                <span className="font-grotesque font-extrabold text-6xl tracking-tight text-neutral-900">R</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={price}
                  onChange={handlePriceInput}
                  className="w-32 text-center font-grotesque font-extrabold text-6xl tracking-tight bg-transparent border-0 outline-none focus:ring-0 p-0"
                  style={{ appearance: 'none' }}
                />
              </div>
              <button 
                className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100 transition-colors" 
                onClick={() => adjustPrice(5)}
              >
                +
              </button>
            </div>
          )}

          {/* Display what user will get for their money */}
          {kind !== 'bundles' && (
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2">
                <span className="text-sm text-neutral-600">You'll get:</span>
                <span className="text-sm font-bold text-neutral-900">
                  {getServiceDisplayValue(kind.toUpperCase() as ServiceType, price)}
                </span>
              </div>
            </div>
          )}

          {/* Payment method selection for Voice/Data/SMS/WhatsApp */}
          {kind !== 'bundles' && (
            <div className="space-y-3">
              <h3 className="text-neutral-900 font-semibold text-sm">Payment Method</h3>
              

              

              <div className={`rounded-xl border ${selectedMethod === 'eft' ? 'border-neutral-900' : 'border-neutral-200'} px-4 py-3 cursor-pointer`} onClick={() => setSelectedMethod('eft')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="size-6 rounded bg-emerald-400 inline-block" />
                    <div>
                      <div className="font-medium">Instant EFT</div>
                      <div className="text-sm text-neutral-500">Credit or debit card</div>
                    </div>
                  </div>
                  <span className={`size-4 rounded-full ${selectedMethod === 'eft' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
                </div>
              </div>
            </div>
          )}

          {/* Bundles - Show Categories or Products */}
          {kind === 'bundles' && !selectedCategory && (
            <div className="space-y-3">
              <h3 className="text-neutral-900 font-semibold text-sm">Choose Bundle Type</h3>
              
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-neutral-200 p-4 h-24 bg-neutral-50" />
                  ))}
                </div>
              )}
              
              {error && (
                <div className="text-center py-8 text-red-600">
                  <p>{error}</p>
                </div>
              )}
              
              {!loading && !error && bundleCategories.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bundleCategories.map((category, idx) => {
                    const colors = [
                      'bg-lime-400 hover:bg-lime-300',
                      'bg-blue-400 hover:bg-blue-300',
                      'bg-purple-400 hover:bg-purple-300',
                      'bg-orange-400 hover:bg-orange-300',
                      'bg-pink-400 hover:bg-pink-300',
                      'bg-cyan-400 hover:bg-cyan-300',
                    ]
                    const colorClass = colors[idx % colors.length]
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`rounded-xl ${colorClass} p-4 text-left transition-all shadow-md hover:shadow-lg`}
                      >
                        <div className="font-bold text-neutral-900 mb-1">{category.name}</div>
                        <div className="text-sm text-neutral-800">
                          {category.productCount} {category.productCount === 1 ? 'option' : 'options'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Show Products when category is selected */}
          {kind === 'bundles' && selectedCategory && !selectedProduct && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-neutral-900 font-semibold text-sm">Select a Bundle</h3>
                <button
                  onClick={handleBackToCategories}
                  className="text-sm text-neutral-600 hover:text-neutral-900 font-medium"
                >
                  ← Back
                </button>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-neutral-200 p-4 h-20 bg-neutral-50" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {renderProductList(products, selectedProduct, setSelectedProduct)}
                </div>
              ) : null}
            </div>
          )}

          {/* Phone Number Selection - Show for bundles when product selected, or always for data/airtime */}
          {(selectedProduct || kind !== 'bundles') && (
            <div className="space-y-2">
              <div className="text-neutral-600 text-sm font-medium">Phone number to top-up</div>
              <div className="relative">
                <button className="w-full flex items-center gap-2 rounded-xl ring-1 ring-neutral-300 px-3 py-2 bg-white text-left" onClick={() => setIsPhoneMenuOpen((v) => !v)}>
                  <img src={`${import.meta.env.BASE_URL}images/plan_logo.png`} alt="limes" className="h-6 w-6" />
                  <span className="flex-1 text-neutral-900">{selectedPhoneNumber || 'Select a SIM'}</span>
                  <span className={`text-neutral-400 transition-transform text-2xl leading-none ${isPhoneMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {isPhoneMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1 z-10 rounded-xl bg-white ring-1 ring-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                    {(phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers : [selectedPhoneNumber]).filter(Boolean).map((num) => (
                      <button key={num} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 text-left" onClick={() => { setSelectedPhoneNumber(num); setIsPhoneMenuOpen(false) }}>
                        <span className="inline-flex items-center justify-center size-6 rounded bg-lime-400 text-neutral-900 text-xs font-bold">SIM</span>
                        <span className="text-neutral-900">{num}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Status Messages */}
          {paymentError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{paymentError}</p>
            </div>
          )}

          {paymentSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
              <p className="text-sm text-green-700">Payment successful! Closing...</p>
            </div>
          )}

          {/* Purchase Button for Voice/Data/SMS/WhatsApp */}
          {kind !== 'bundles' && selectedPhoneNumber && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl bg-neutral-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Type</span>
                  <span className="font-semibold text-neutral-900 capitalize">{kind}</span>
                </div>
                <div className="border-t border-neutral-300 pt-2 flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="font-bold text-2xl text-neutral-900">{formattedPrice}</span>
                </div>
              </div>

              <button
                onClick={handlePurchaseDynamicService}
                disabled={isPaymentProcessing || paymentSuccess}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-3 hover:bg-lime-300 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPaymentProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentSuccess ? (
                  <span>✓ Success</span>
                ) : (
                  <>
                    <span>Purchase Airtime</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Purchase Button - Only show when product is selected for bundles */}
          {kind === 'bundles' && selectedProduct && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl bg-neutral-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Bundle</span>
                  <span className="font-semibold text-neutral-900">{selectedProduct.name}</span>
                </div>
                <div className="border-t border-neutral-300 pt-2 flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Total</span>
                  <span className="font-bold text-2xl text-neutral-900">R{selectedProduct.price.toFixed(2)}</span>
                </div>
              </div>

              {selectedPhoneNumber ? (
                <button
                  onClick={handlePurchaseBundle}
                  disabled={isPaymentProcessing || paymentSuccess}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-3 hover:bg-lime-300 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPaymentProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : paymentSuccess ? (
                    <span>✓ Success</span>
                  ) : (
                    <>
                      <span>Purchase Bundle</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-neutral-600">Please select a phone number above</p>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}


