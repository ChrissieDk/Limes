import { useEffect, useState } from 'react'
import { catalogService } from '../../catalog/services/catalogService'
import { paymentService } from '../../payment/services/paymentService'
import type { CatalogProduct, CatalogCategoryNode } from '../../../types'
import { Loader2 } from 'lucide-react'

// Paystack Popup
declare const PaystackPop: any

type TopUpKind = 'data' | 'airtime' | 'bundles'

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
  const [kind] = useState<TopUpKind>('bundles') // Default to bundles (data/airtime commented out)
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>(phoneNumber ?? (phoneNumbers?.[0] ?? ''))
  
  // Bundle categories and products from catalog
  const [bundleCategories, setBundleCategories] = useState<CatalogCategoryNode[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Payment states
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

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

  // Fetch bundle categories when modal opens and bundles tab is active
  useEffect(() => {
    if (!open || kind !== 'bundles') return
    
    const fetchBundleCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const tree = await catalogService.getCategoryTree({ groupCode: 123, groupOnly: true })
        console.log('[TopUp] Full category tree:', tree)
        
        // Navigate: tree -> channel -> website -> gsm_products -> children
        const channel = tree.find((node) => node.id === 'channel')
        if (!channel) {
          setError('Channel category not found')
          return
        }
        
        const website = channel.children?.find((node) => node.id === 'website')
        if (!website) {
          setError('Website category not found')
          return
        }
        
        const gsmProducts = website.children?.find((node) => node.id === 'gsm_products')
        if (!gsmProducts) {
          setError('GSM Products category not found')
          return
        }
        
        if (gsmProducts.children && gsmProducts.children.length > 0) {
          setBundleCategories(gsmProducts.children)
          console.log('[TopUp] Bundle categories:', gsmProducts.children)
        } else {
          setError('No bundle categories found')
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
        
        setProducts(response.data)
        console.log(`[TopUp] Fetched products from ${selectedCategory}:`, response)
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
            const verificationResponse = await paymentService.verifyPayment({
              reference: transaction.reference || initResponse.data?.reference || '',
              saveCard: false, // Once-off top-up, don't save card
            })

            if (verificationResponse.success) {
              setPaymentSuccess(true)
              setTimeout(() => {
                setPaymentSuccess(false)
                setSelectedCategory(null)
                setSelectedProduct(null)
                onClose()
              }, 2000)
            } else {
              setPaymentError(verificationResponse.error || 'Payment verification failed')
            }
          } catch (err: any) {
            setPaymentError(err.response?.data?.message || 'Payment verification failed')
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
          {/* Tab Selection - Data and Airtime commented out for future use */}
          <div className="flex items-center justify-center gap-3">
            {/* <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'data' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('data')}>Data</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'airtime' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('airtime')}>Airtime</button> */}
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold bg-neutral-900 text-white`}>Bundles</button>
          </div>

          {/* Commented out for future use - Data/Airtime entry modes */}
          {/* {kind !== 'bundles' && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <span>Switch to</span>
              {entryMode === 'price' ? (
                <button className="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700" onClick={() => setEntryMode('quantity')}>{kind === 'data' ? 'Data' : 'Cost Price'}</button>
              ) : (
                <button className="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700" onClick={() => setEntryMode('price')}>Cost Price</button>
              )}
            </div>
          )} */}

          {/* Commented out for future use - Price/Data entry UI */}
          {/* {kind !== 'bundles' && (entryMode === 'price' ? (
            <div className="flex items-center justify-center gap-4 select-none">
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustPrice(-10)}>−</button>
              <div className="font-grotesque font-extrabold text-6xl tracking-tight">{formattedPrice}</div>
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustPrice(10)}>+</button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 select-none">
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustData(-1)}>−</button>
              <div className="flex items-center gap-2">
                <div className="font-grotesque font-extrabold text-6xl tracking-tight">{dataQty}</div>
                {kind === 'data' && (
                  <div className="relative">
                    <select className="appearance-none bg-neutral-100 text-neutral-700 rounded-lg px-2 py-1 text-sm" value={dataUnit} onChange={(e) => setDataUnit(e.target.value as 'GB' | 'MB')}>
                      <option value="GB">GB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                )}
              </div>
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustData(1)}>+</button>
            </div>
          ))} */}

          {/* Commented out for future use - Save banner */}
          {/* {kind !== 'bundles' && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-lime-100 text-lime-700 px-3 py-1 text-sm">Save R20!</span>
              {entryMode === 'price' && <span className="text-neutral-500 text-sm">{formattedPrice}.00</span>}
            </div>
          )} */}

          {/* Commented out for future use - Payment method selection */}
          {/* <div className="space-y-3">
            <div className={`rounded-xl border-2 ${selectedMethod === 'wallet' ? 'border-neutral-900' : 'border-neutral-200'} bg-lime-400/80 px-4 py-3 text-neutral-900`}
                 onClick={() => setSelectedMethod('wallet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center size-9 rounded-lg bg-neutral-900/10">▣</div>
                  <div>
                    <div className="font-semibold">Wallet</div>
                    <div className="text-sm">Total: R230.60</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-white text-neutral-900 px-3 py-1.5 text-sm ring-2 ring-neutral-900/90">Apply max amount</button>
                  <span className={`size-4 rounded-full ${selectedMethod === 'wallet' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl border ${selectedMethod === 'card' ? 'border-neutral-900' : 'border-neutral-200'} px-4 py-3 cursor-pointer`} onClick={() => setSelectedMethod('card')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded bg-red-500 inline-block" />
                  <div>
                    <div className="font-medium">Mastercard ending in 1234</div>
                    <div className="text-sm text-neutral-500">Expiry 06/2028</div>
                  </div>
                </div>
                <span className={`size-4 rounded-full ${selectedMethod === 'card' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
              </div>
            </div>

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
          </div> */}

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

          {/* Phone Number Selection - Only show when product is selected */}
          {selectedProduct && (
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

          {/* Purchase Button - Only show when product is selected */}
          {selectedProduct && (
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


