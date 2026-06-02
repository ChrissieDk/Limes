import { useEffect, useState } from 'react'
import { paymentService } from '../../payment/services/paymentService'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { dynamicServicesPaymentService } from '../../payment/services/dynamicServicesPaymentService'
import { getServiceDisplayValue, convertRandsToServiceValue, getDefaultExpiryDate, toCents } from '../../payment/utils/dynamicPricing'
import type { CatalogProduct } from '../../../types'
import type { ServiceType } from '../../payment/config/ratingTable'
import { Loader2 } from 'lucide-react'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import { log } from '../../../lib/sentry-logger'
import { trackPurchase, trackBeginCheckout } from '../../analytics/services/analyticsService'
import { useTopUpData } from './useTopUpData'
import BundleCategoryGrid from './BundleCategoryGrid'
import SavedCardSelector from '../../payment/components/SavedCardSelector'
import type { SavedCard } from '../../../types/payment'

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

interface ProductListProps {
  products: CatalogProduct[]
  selectedProduct: CatalogProduct | null
  onSelect: (product: CatalogProduct) => void
  categoryId: string | null
}

function getCategoryColor(catId: string | null): string {
  const colorMap: Record<string, string> = {
    data: 'bg-[#ABFF63]/20',
    voice: 'bg-pink-300/60',
    sms: 'bg-[#629BFC]/20',
    whatsapp: 'bg-[#FF9F66]/20',
  }
  return colorMap[catId || ''] || 'bg-neutral-200'
}

function ProductList({ products, selectedProduct, onSelect, categoryId }: ProductListProps) {
  const priceBgColor = getCategoryColor(categoryId)
  return (
    <>
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onSelect(product)}
          className={`w-full rounded-2xl border-2 ${
            selectedProduct?.id === product.id
              ? 'border-neutral-900 bg-neutral-50'
              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50'
          } p-5 text-left transition-all active:scale-[0.98]`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-grotesque font-bold text-neutral-900 text-base">{product.name}</div>
              <div className="font-manrope text-sm text-neutral-600 mt-1.5 line-clamp-1">{product.description}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`inline-block px-3 py-1.5 rounded-lg ${priceBgColor}`}>
                <div className="font-bold text-lg text-neutral-900">R{product.price.toFixed(2)}</div>
              </div>
              <div className="font-manrope text-xs text-neutral-500 font-medium mt-1">once-off</div>
            </div>
          </div>
        </button>
      ))}
    </>
  )
}

function PriceInput({ price, onChange, onAdjust }: { price: number; onChange: (v: number) => void; onAdjust: (delta: number) => void }) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value === '') {
      onChange(1)
    } else {
      onChange(Math.max(1, Math.min(1000, parseInt(value, 10))))
    }
  }

  return (
    <div className="flex items-center justify-center gap-5">
      <button
        className="size-12 grid place-items-center rounded-xl ring-2 ring-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all text-xl font-bold text-neutral-700"
        onClick={() => onAdjust(-5)}
      >
        −
      </button>
      <div className="flex items-center justify-center gap-1">
        <span className="font-grotesque font-extrabold text-6xl tracking-tight text-neutral-900">R</span>
        <input
          type="text"
          inputMode="numeric"
          value={price}
          onChange={handleInput}
          className="w-32 text-center font-grotesque font-extrabold text-6xl tracking-tight bg-transparent border-0 outline-none focus:ring-0 p-0 text-neutral-900"
          style={{ appearance: 'none' }}
        />
      </div>
      <button
        className="size-12 grid place-items-center rounded-xl ring-2 ring-neutral-200 hover:bg-neutral-50 active:scale-95 transition-all text-xl font-bold text-neutral-700"
        onClick={() => onAdjust(5)}
      >
        +
      </button>
    </div>
  )
}

function PaymentSummary({ label, amount, onPurchase, isProcessing, isSuccess }: {
  label: string
  amount: string
  onPurchase: () => void
  isProcessing: boolean
  isSuccess: boolean
}) {
  return (
    <div className="space-y-3 pt-2">
      <div className="rounded-2xl bg-neutral-50 p-5 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-600 font-medium">{label}</span>
          <span className="font-semibold text-neutral-900">{label === 'Bundle' ? amount : 'Airtime'}</span>
        </div>
        <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
          <span className="font-grotesque font-bold text-neutral-900 text-base">Total</span>
          <span className="font-grotesque font-bold text-3xl text-neutral-900">{amount}</span>
        </div>
      </div>

      <button
        onClick={onPurchase}
        disabled={isProcessing || isSuccess}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#ABFF63] text-neutral-900 font-bold px-6 py-3.5 hover:brightness-95 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed text-base"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isSuccess ? (
          <span>✓ Success</span>
        ) : (
          <>
            <span>Purchase {label}</span>
            <span>→</span>
          </>
        )}
      </button>
    </div>
  )
}

export default function TopUpModal({ open, onClose, phoneNumber, phoneNumbers }: TopUpModalProps) {
  const [kind, setKind] = useState<TopUpKind>('bundles')
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>(phoneNumber ?? (phoneNumbers?.[0] ?? ''))

  // Price input for voice/data/sms/whatsapp (cost-based only)
  const [price, setPrice] = useState(50)

  // Payment states
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  // Saved card states
  const [savedCards, setSavedCards] = useState<SavedCard[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [saveCardForFuture, setSaveCardForFuture] = useState(true)

  const {
    bundleCategories,
    selectedCategory,
    products,
    selectedProduct,
    loading,
    error,
    setSelectedCategory,
    setSelectedProduct,
    handleBackToCategories,
  } = useTopUpData(open, kind)

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

  // Fetch saved cards when modal opens
  useEffect(() => {
    if (!open) return
    const fetchCards = async () => {
      try {
        const cards = await paymentService.getSavedCards()
        // Deduplicate using same logic as SavedCards component
        const cardMap = new Map<string, SavedCard>()
        cards.forEach((card) => {
          const key = `${card.last4}-${card.expMonth}-${card.expYear}-${card.bank}`
          const existing = cardMap.get(key)
          if (!existing || card.isDefault || card.id > existing.id) {
            cardMap.set(key, card)
          }
        })
        const uniqueCards = Array.from(cardMap.values())
        setSavedCards(uniqueCards)

        // Auto-select default card, or first card if no default
        const defaultCard = uniqueCards.find((c) => c.isDefault)
        if (defaultCard) {
          setSelectedPaymentMethodId(defaultCard.id)
        } else if (uniqueCards.length > 0) {
          setSelectedPaymentMethodId(uniqueCards[0].id)
        } else {
          setSelectedPaymentMethodId(null)
        }
      } catch {
        // Silently fail — user can always pay with new card
        setSavedCards([])
        setSelectedPaymentMethodId(null)
      }
    }
    fetchCards()
  }, [open])

  const adjustPrice = (delta: number) => {
    setPrice((prev) => Math.max(1, Math.min(1000, prev + delta)))
  }

  const formattedPrice = `R${price}`

  const resetPayment = () => {
    setPaymentSuccess(true)
    window.dispatchEvent(new CustomEvent('limes:payment-success'))
    setTimeout(() => {
      setPaymentSuccess(false)
      setSelectedCategory(null)
      setSelectedProduct(null)
      setPrice(50)
      setSaveCardForFuture(false)
      onClose()
    }, 2000)
  }

  // ── Shared post-payment finalizers ─────────────────────────────

  const finalizeBundlePurchase = async (reference: string) => {
    if (!selectedProduct || !selectedPhoneNumber) return

    const orderResponse = await subscriptionService.createOrder({
      products: [{ id: selectedProduct.id, amount: selectedProduct.price }],
      msisdn: selectedPhoneNumber,
    })

    if (orderResponse.orderId) {
      await paymentService.linkTransactionToOrder({
        transactionReference: reference,
        orderId: orderResponse.orderId,
      })
      log.info('topup_bundle_order_created', { reference, order_id: orderResponse.orderId })
    } else if (!orderResponse.message) {
      log.error('topup_bundle_order_failed', { reference, response: JSON.stringify(orderResponse) })
      throw new Error('Order creation failed - no orderId or message in response')
    }

    trackPurchase({
      transactionId: reference,
      value: selectedProduct.price,
      currency: 'ZAR',
      items: [
        {
          item_id: String(selectedProduct.id),
          item_name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1,
          item_category: 'bundle',
        },
      ],
      paymentType: 'card',
    })

    resetPayment()
  }

  const finalizeDynamicServicePurchase = async (reference: string) => {
    if (!selectedPhoneNumber || kind === 'bundles') return

    const sv = convertRandsToServiceValue(kind.toUpperCase() as ServiceType, price, 'prepaid')
    if (sv === null) {
      log.error('topup_dynamic_service_conversion_failed', { kind, price })
      throw new Error(`${kind} service is not available for prepaid packages`)
    }

    const dc = (kind.toUpperCase() === 'AIRTIME' ? 'GPA_CREDIT' : kind.toUpperCase()) as 'DATA' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'GPA_CREDIT'
    const servicesResponse = await subscriptionService.createDynamicServices(selectedPhoneNumber, {
      services: [{ value: sv, definitionCode: dc, expiryDate: getDefaultExpiryDate() }],
    })

    const serviceIds = servicesResponse.results.filter((r) => r.success && r.id).map((r) => r.id!)
    if (serviceIds.length === 0) {
      log.error('topup_dynamic_no_services_created', { reference, response: JSON.stringify(servicesResponse.results) })
      throw new Error('No services created')
    }

    await paymentService.linkTransactionToServices({
      transactionReference: reference,
      serviceIds,
    })

    log.info('topup_dynamic_services_linked', { reference, service_count: serviceIds.length })

    trackPurchase({
      transactionId: reference,
      value: price,
      currency: 'ZAR',
      items: [
        {
          item_id: `${kind}_topup`,
          item_name: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Top-up`,
          price: price,
          quantity: 1,
          item_category: kind,
        },
      ],
      paymentType: 'card',
    })

    resetPayment()
  }

  // Handle bundle purchase
  const handlePurchaseBundle = async () => {
    if (!selectedProduct || !selectedPhoneNumber) {
      setPaymentError('Please select a bundle and phone number')
      log.warn('topup_bundle_init_failed', { reason: 'missing_product_or_phone' })
      return
    }

    if (!selectedProduct.price) {
      setPaymentError('Price is missing for bundle')
      log.error('topup_bundle_init_failed', { reason: 'price_missing', product_id: selectedProduct.id })
      return
    }

    setIsPaymentProcessing(true)
    setPaymentError(null)

    // Safety check: verify SIM is still active before charging
    try {
      const status = await subscriptionService.checkSimActive(selectedPhoneNumber)
      if (!status.isActive) {
        setPaymentError('This SIM is not active. Please wait for activation to complete before topping up.')
        setIsPaymentProcessing(false)
        return
      }
    } catch (err) {
      // If the check itself fails, log and allow the purchase to proceed.
      // The backend is the ultimate gatekeeper.
      log.warn('topup_bundle_sim_status_check_failed', { msisdn: selectedPhoneNumber, error: getAxiosErrorMessage(err, 'unknown') })
    }

    try {
      const amountInCents = toCents(selectedProduct.price)

      // ── Saved card path ────────────────────────────────────────
      if (selectedPaymentMethodId) {
        log.info('topup_bundle_charge_saved_card', {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          msisdn: selectedPhoneNumber,
          amount_cents: amountInCents,
          payment_method_id: selectedPaymentMethodId,
        })

        trackBeginCheckout({
          value: selectedProduct.price,
          currency: 'ZAR',
          items: [
            {
              item_id: String(selectedProduct.id),
              item_name: selectedProduct.name,
              price: selectedProduct.price,
              quantity: 1,
              item_category: 'bundle',
            },
          ],
        })

        const chargeResponse = await paymentService.chargeSavedCard({
          paymentMethodId: selectedPaymentMethodId,
          amount: amountInCents,
          productId: String(selectedProduct.id),
          msisdn: String(selectedPhoneNumber),
        })

        if (!chargeResponse.success || !chargeResponse.transaction) {
          log.error('topup_bundle_charge_failed', { error: chargeResponse.error || 'unknown' })
          setPaymentError(chargeResponse.error || 'Failed to charge saved card')
          return
        }

        const reference = chargeResponse.transaction.reference
        log.info('topup_bundle_charge_successful', { reference })

        await finalizeBundlePurchase(reference)
        return
      }

      // ── New card path (Paystack popup) ─────────────────────────
      const payload = {
        productId: String(selectedProduct.id),
        msisdn: String(selectedPhoneNumber),
        amount: amountInCents,
      }

      log.info('topup_bundle_initializing', {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        msisdn: selectedPhoneNumber,
        amount_cents: payload.amount,
        kind: 'bundle',
      })

      const initResponse = await paymentService.initializeTransaction(payload)

      if (!initResponse.success || !initResponse.data) {
        log.error('topup_bundle_init_failed', { error: initResponse.error || 'unknown' })
        setPaymentError(initResponse.error || 'Failed to initialize payment')
        return
      }

      log.info('topup_bundle_initialized', { reference: initResponse.data.reference })

      trackBeginCheckout({
        value: selectedProduct.price,
        currency: 'ZAR',
        items: [
          {
            item_id: String(selectedProduct.id),
            item_name: selectedProduct.name,
            price: selectedProduct.price,
            quantity: 1,
            item_category: 'bundle',
          },
        ],
      })

      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: async (transaction: Record<string, unknown>) => {
          try {
            const reference = String(transaction.reference || initResponse.data?.reference || '')
            log.info('topup_bundle_payment_verifying', { reference })

            const verificationResponse = await paymentService.verifyPayment({
              reference,
              saveCard: saveCardForFuture,
            })

            if (!verificationResponse.success) {
              log.error('topup_bundle_verification_failed', { reference, error: verificationResponse.error || 'unknown' })
              throw new Error(verificationResponse.error || 'Payment verification failed')
            }
            log.info('topup_bundle_verified', { reference })

            await finalizeBundlePurchase(reference)
          } catch (err) {
            const errMsg = getAxiosErrorMessage(err, 'Payment processing failed')
            log.error('topup_bundle_processing_failed', { error: errMsg })
            setPaymentError(errMsg)
          }
        },
        onCancel: () => {
          log.warn('topup_bundle_cancelled_by_user', { product_id: selectedProduct.id })
          setPaymentError(null)
        },
      })
    } catch (error) {
      const errMsg = getAxiosErrorMessage(error, 'Failed to process payment')
      log.error('topup_bundle_exception', { error: errMsg })
      setPaymentError(errMsg)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  // Handle dynamic service purchase (Voice, Data, SMS, WhatsApp)
  const handlePurchaseDynamicService = async () => {
    if (!selectedPhoneNumber || kind === 'bundles') {
      setPaymentError('Please select a phone number')
      log.warn('topup_dynamic_init_failed', { reason: 'missing_phone_or_wrong_kind', kind })
      return
    }

    setIsPaymentProcessing(true)
    setPaymentError(null)

    // Safety check: verify SIM is still active before charging
    try {
      const status = await subscriptionService.checkSimActive(selectedPhoneNumber)
      if (!status.isActive) {
        setPaymentError('This SIM is not active. Please wait for activation to complete before topping up.')
        setIsPaymentProcessing(false)
        return
      }
    } catch (err) {
      // If the check itself fails, log and allow the purchase to proceed.
      // The backend is the ultimate gatekeeper.
      log.warn('topup_dynamic_sim_status_check_failed', { msisdn: selectedPhoneNumber, error: getAxiosErrorMessage(err, 'unknown') })
    }

    try {
      const serviceType = kind.toUpperCase() as ServiceType
      const serviceValue = convertRandsToServiceValue(serviceType, price, 'prepaid')

      if (serviceValue === null) {
        setPaymentError(`${kind} service is not available for prepaid packages`)
        log.warn('topup_dynamic_init_failed', { reason: 'service_unavailable', service_type: serviceType, price })
        return
      }

      const expiryDate = getDefaultExpiryDate()
      const priceInCents = price * 100
      const definitionCode = serviceType === 'AIRTIME' ? 'GPA_CREDIT' : serviceType

      // ── Saved card path ────────────────────────────────────────
      if (selectedPaymentMethodId) {
        log.info('topup_dynamic_charge_saved_card', {
          msisdn: selectedPhoneNumber,
          service_type: serviceType,
          definition_code: definitionCode,
          price_cents: priceInCents,
          payment_method_id: selectedPaymentMethodId,
        })

        trackBeginCheckout({
          value: price,
          currency: 'ZAR',
          items: [
            {
              item_id: `${kind}_topup`,
              item_name: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Top-up`,
              price: price,
              quantity: 1,
              item_category: kind,
            },
          ],
        })

        const chargeResponse = await paymentService.chargeSavedCard({
          paymentMethodId: selectedPaymentMethodId,
          amount: priceInCents,
          msisdn: String(selectedPhoneNumber),
        })

        if (!chargeResponse.success || !chargeResponse.transaction) {
          log.error('topup_dynamic_charge_failed', { error: chargeResponse.error || 'unknown' })
          setPaymentError(chargeResponse.error || 'Failed to charge saved card')
          return
        }

        const reference = chargeResponse.transaction.reference
        log.info('topup_dynamic_charge_successful', { reference })

        await finalizeDynamicServicePurchase(reference)
        return
      }

      // ── New card path (Paystack popup) ─────────────────────────
      const payload = {
        msisdn: String(selectedPhoneNumber),
        services: [
          {
            value: serviceValue,
            definitionCode: definitionCode as 'DATA' | 'VOICE' | 'SMS' | 'WHATSAPP' | 'GPA_CREDIT',
            expiryDate,
            priceInCents,
          },
        ],
      }

      log.info('topup_dynamic_initializing', {
        msisdn: selectedPhoneNumber,
        service_type: serviceType,
        definition_code: definitionCode,
        price_cents: priceInCents,
        kind,
      })

      const initResponse = await dynamicServicesPaymentService.initializePayment(payload)

      if (!initResponse.success || !initResponse.data) {
        log.error('topup_dynamic_init_failed', { error: initResponse.error || 'unknown' })
        setPaymentError(initResponse.error || 'Failed to initialize payment')
        return
      }

      log.info('topup_dynamic_initialized', { reference: initResponse.data.reference })

      trackBeginCheckout({
        value: price,
        currency: 'ZAR',
        items: [
          {
            item_id: `${kind}_topup`,
            item_name: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Top-up`,
            price: price,
            quantity: 1,
            item_category: kind,
          },
        ],
      })

      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: async (transaction: Record<string, unknown>) => {
          try {
            const reference = String(transaction.reference || initResponse.data?.reference || '')
            log.info('topup_dynamic_payment_verifying', { reference })

            const verificationResponse = await paymentService.verifyPayment({
              reference,
              saveCard: saveCardForFuture,
            })

            if (!verificationResponse.success) {
              log.error('topup_dynamic_verification_failed', { reference, error: verificationResponse.error || 'unknown' })
              throw new Error(verificationResponse.error || 'Payment verification failed')
            }
            log.info('topup_dynamic_verified', { reference })

            await finalizeDynamicServicePurchase(reference)
          } catch (err) {
            const errMsg = getAxiosErrorMessage(err, 'Payment processing failed')
            log.error('topup_dynamic_processing_failed', { error: errMsg })
            setPaymentError(errMsg)
          }
        },
        onCancel: () => {
          log.warn('topup_dynamic_cancelled_by_user', { msisdn: selectedPhoneNumber, kind, price })
          setPaymentError(null)
        },
      })
    } catch (error) {
      const errMsg = getAxiosErrorMessage(error, 'Failed to process payment')
      log.error('topup_dynamic_exception', { error: errMsg })
      setPaymentError(errMsg)
    } finally {
      setIsPaymentProcessing(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg sm:max-w-xl mx-0 sm:mx-4 rounded-3xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 sticky top-0 bg-white z-10 rounded-t-3xl">
          <div>
            <div className="font-grotesque font-bold text-xl text-neutral-900">Top-up</div>
            <div className="font-manrope text-sm text-neutral-500 mt-0.5">Enter the details below to top-up</div>
          </div>
          <button aria-label="Close" className="size-10 grid place-items-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 text-2xl transition-colors" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-6 space-y-5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  kind === 'airtime'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                onClick={() => setKind('airtime')}
              >
                Airtime
              </button>
              <button
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  kind === 'bundles'
                    ? 'bg-neutral-900 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
                onClick={() => setKind('bundles')}
              >
                Bundles
              </button>
            </div>

            {kind !== 'bundles' && (
              <>
                <PriceInput price={price} onChange={setPrice} onAdjust={adjustPrice} />
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#ABFF63]/20 px-4 py-2.5">
                    <span className="font-manrope text-sm text-neutral-700">You'll get:</span>
                    <span className="font-grotesque text-sm font-bold text-neutral-900">
                      {getServiceDisplayValue(kind.toUpperCase() as ServiceType, price)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {kind === 'bundles' && !selectedCategory && (
              <div className="space-y-4">
                <h3 className="font-grotesque text-neutral-900 font-semibold text-base">Choose Bundle Type</h3>

                {loading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 p-4 h-28 bg-neutral-50" />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <div className="inline-block rounded-xl bg-red-50 border-2 border-red-200 px-6 py-4">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && bundleCategories.length > 0 && (
                  <BundleCategoryGrid categories={bundleCategories} onSelect={setSelectedCategory} />
                )}
              </div>
            )}

            {kind === 'bundles' && selectedCategory && !selectedProduct && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-grotesque text-neutral-900 font-semibold text-base">Select a Bundle</h3>
                  <button
                    onClick={handleBackToCategories}
                    className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold transition-colors inline-flex items-center gap-1"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl border border-neutral-200 p-5 h-24 bg-neutral-50" />
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <ProductList products={products} selectedProduct={selectedProduct} onSelect={setSelectedProduct} categoryId={selectedCategory} />
                  </div>
                ) : null}
              </div>
            )}

            {(selectedProduct || kind !== 'bundles') && (
              <div className="space-y-2">
                <div className="font-grotesque text-neutral-700 text-sm font-semibold">Phone number to top-up</div>
                <div className="relative">
                  <button className="w-full flex items-center gap-3 rounded-xl ring-1 ring-neutral-300 px-4 py-3 bg-white text-left hover:ring-neutral-400 transition-all" onClick={() => setIsPhoneMenuOpen((v) => !v)}>
                    <img src={`${import.meta.env.BASE_URL}images/plan_phone.svg`} alt="" className="h-6 w-6" />
                    <span className="flex-1 text-neutral-900 font-medium">{selectedPhoneNumber || 'Select a SIM'}</span>
                    <span className={`text-neutral-400 transition-transform text-xl leading-none ${isPhoneMenuOpen ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {isPhoneMenuOpen && (
                    <div className="absolute left-0 right-0 mt-2 z-10 rounded-xl bg-white ring-1 ring-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {(phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers : [selectedPhoneNumber]).filter(Boolean).map((num) => (
                        <button key={num} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 text-left transition-colors" onClick={() => { setSelectedPhoneNumber(num); setIsPhoneMenuOpen(false) }}>
                          <span className="font-manrope inline-flex items-center justify-center size-6 rounded bg-[#ABFF63] text-neutral-900 text-xs font-bold">SIM</span>
                          <span className="text-neutral-900 font-medium">{num}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentError && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                <p className="text-sm font-medium text-red-700">{paymentError}</p>
              </div>
            )}

            {paymentSuccess && (
              <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                <p className="font-manrope text-sm font-medium text-green-700">Payment successful! Closing...</p>
              </div>
            )}

            {/* Saved card selector — only show at the purchase step */}
            {((kind === 'bundles' && selectedProduct) || (kind !== 'bundles' && selectedPhoneNumber)) && savedCards.length > 0 && (
              <SavedCardSelector
                selectedCardId={selectedPaymentMethodId}
                onSelect={setSelectedPaymentMethodId}
                disabled={isPaymentProcessing || paymentSuccess}
              />
            )}

            {/* Save card checkbox — only when paying with new card */}
            {((kind === 'bundles' && selectedProduct) || (kind !== 'bundles' && selectedPhoneNumber)) && selectedPaymentMethodId === null && (
              <label className="flex items-center gap-3 rounded-xl border-2 border-neutral-200 px-4 py-3 cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={saveCardForFuture}
                  onChange={(e) => setSaveCardForFuture(e.target.checked)}
                  disabled={isPaymentProcessing || paymentSuccess}
                  className="w-4 h-4 rounded border-neutral-300 text-[#ABFF63] focus:ring-[#ABFF63] focus:ring-offset-0 accent-[#ABFF63]"
                />
                <span className="text-sm text-neutral-700 font-medium">Save this card for faster checkout next time</span>
              </label>
            )}

            {kind !== 'bundles' && selectedPhoneNumber && (
              <PaymentSummary
                label="Type"
                amount={formattedPrice}
                onPurchase={handlePurchaseDynamicService}
                isProcessing={isPaymentProcessing}
                isSuccess={paymentSuccess}
              />
            )}

            {kind === 'bundles' && selectedProduct && (
              <PaymentSummary
                label="Bundle"
                amount={`R${selectedProduct.price.toFixed(2)}`}
                onPurchase={handlePurchaseBundle}
                isProcessing={isPaymentProcessing}
                isSuccess={paymentSuccess}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
