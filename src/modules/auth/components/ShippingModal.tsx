import { useEffect, useState } from 'react'
import { Plus, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import TextField from './TextField'
import { paymentService } from '../../payment/services/paymentService'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { convertRandsToServiceValue, getDefaultExpiryDate, toCents } from '../../payment/utils/dynamicPricing'
import type { DynamicServicePaymentItem } from '../../../types/payment'

// Load Paystack Inline JS
declare const PaystackPop: any

interface Address {
  streetNo: string
  streetName: string
  suburb?: string
  city: string
  stateOrProvince: string
  postCode: string
  country: string
}

interface SelectedPackage {
  productId: string
  simPackageProductId?: string  // The actual SIM package product ID (7029225P, 7025225P, 7023225P)
  name: string
  price: number
  priceInCents?: number  // For Paystack payment
  packageType?: 'contract' | 'prepaid'
  simStatus?: 'has-sim' | 'needs-sim'
  planChargeType?: 'once-off' | 'monthly'  // Indicates if it's a one-time or recurring charge
  iccid?: string
  isDynamicPlan?: boolean  // True for contract dynamic plans
  isComboBundle?: boolean  // True for contract combo bundles (m2m_combo)
  planAllocation?: {  // Allocation in Rands for each service (contract dynamic plans)
    data: number
    voice: number
    sms: number
    whatsapp: number
  }
  comboDetails?: any  // Full combo package details (benefits, pricing, etc.)
  features?: {
    mobileData?: string
    description?: string
    airtime?: string
    messaging?: string
    phone?: string
  }
}

interface RicaData {
  address: {
    streetNo: string
    streetName: string
    suburb?: string
    city: string
    stateOrProvince: string
    postCode: string
    country: string
  }
  customerInfo: {
    firstname: string
    lastname: string
    billEmail: string
    phoneNumber: string
  }
}

interface ShippingModalProps {
  open: boolean
  onClose: () => void
  defaultAddress?: Address
  selectedPackage?: SelectedPackage
  onPay?: () => void
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  allocatedMsisdn?: string  // DEPRECATED: Will be removed - MSISDN now allocated after payment
  ricaData?: RicaData  // NEW: RICA data for post-payment subscriber creation
}

export default function ShippingModal({ 
  open, 
  onClose, 
  defaultAddress,
  selectedPackage,
  onPay,
  customerEmail = '',
  customerName = '',
  customerPhone = '',
  ricaData
}: ShippingModalProps) {
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0)
  
  // Customer details for payment
  const [email, setEmail] = useState(customerEmail)
  const [name, setName] = useState(customerName)
  const [phone, setPhone] = useState(customerPhone)
  
  // Address form states
  const [streetNo, setStreetNo] = useState('')
  const [streetName, setStreetName] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [stateOrProvince, setStateOrProvince] = useState('')
  const [postCode, setPostCode] = useState('')
  const [country, setCountry] = useState('South Africa')

  // Addresses list (default + any new ones)
  const [addresses, setAddresses] = useState<Address[]>([])
  
  // Payment states
  const [isInitializing, setIsInitializing] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [allocatedMsisdn, setAllocatedMsisdn] = useState<string | null>(null)  // For contract flow: MSISDN allocated before payment

  const formatAddress = (addr: Address) => {
    const parts = [
      addr.streetNo,
      addr.streetName,
      addr.suburb,
      addr.city,
      addr.stateOrProvince,
      addr.postCode,
      addr.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  // Set default address when prop changes
  useEffect(() => {
    if (defaultAddress) {
      setAddresses([defaultAddress])
      setSelectedAddressIndex(0)
    }
  }, [defaultAddress])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Update customer details when props change
  useEffect(() => {
    setEmail(customerEmail)
    setName(customerName)
    setPhone(customerPhone)
  }, [customerEmail, customerName, customerPhone]) 

  // Initialize payment (SECURE - Backend controls amount and creates order)
  const handleInitializePayment = async () => {
    if (!email || !name || !phone || !selectedPackage) {
      return
    }

    setIsInitializing(true)
    setVerificationError(null)

    try {

      let initResponse: { success: boolean; data?: { access_code: string; reference: string }; error?: string }

      // CONTRACT DYNAMIC PLANS: Create subscriber FIRST, then initialize with MSISDN + services
      if (selectedPackage.packageType === 'contract' && selectedPackage.isDynamicPlan && selectedPackage.planAllocation) {
        
        if (!ricaData) {
          setVerificationError('RICA data is required for contract plans')
          return
        }

        if (!selectedPackage.simPackageProductId) {
          setVerificationError('SIM package product ID is required')
          return
        }

        // STEP 1: Create subscriber to get MSISDN
        const subscriberPayload = {
          productId: selectedPackage.simPackageProductId,
          eSim: false,
          address: ricaData.address ? [{
            referredType: 'SUBSCRIBER',
            addressType: 'INSTALLATION',
            ...ricaData.address,
            oneLineAddress: `${ricaData.address.streetNo} ${ricaData.address.streetName}, ${ricaData.address.city}`
          }] : []
        }
        
        const subscriberResponse = await subscriptionService.createSubscription(subscriberPayload)
        const allocatedMsisdn = subscriberResponse.msisdn

        // Store MSISDN for later use in verification
        setAllocatedMsisdn(allocatedMsisdn)

        // STEP 2: Initialize dynamic services payment with MSISDN
        
        // Convert plan allocation (in Rands) to services array
        const services: DynamicServicePaymentItem[] = []
        const expiryDate = getDefaultExpiryDate()
        
        if (selectedPackage.planAllocation.data > 0) {
          const dataValue = convertRandsToServiceValue('DATA', selectedPackage.planAllocation.data, selectedPackage.packageType || 'prepaid')
          if (dataValue !== null) {
            services.push({
              value: dataValue,
              definitionCode: 'DATA',
              expiryDate,
              priceInCents: selectedPackage.planAllocation.data * 100
            })
          }
        }
        
        if (selectedPackage.planAllocation.voice > 0) {
          services.push({
            value: selectedPackage.planAllocation.voice,
            definitionCode: 'GPA_CREDIT',
            expiryDate,
            priceInCents: selectedPackage.planAllocation.voice * 100
          })
        }
        
        if (selectedPackage.planAllocation.sms > 0) {
          const smsValue = convertRandsToServiceValue('SMS', selectedPackage.planAllocation.sms, selectedPackage.packageType || 'prepaid')
          if (smsValue !== null) {
            services.push({
              value: smsValue,
              definitionCode: 'SMS',
              expiryDate,
              priceInCents: selectedPackage.planAllocation.sms * 100
            })
          }
        }

        const dynamicPayload = {
          msisdn: allocatedMsisdn,
          services
        }
        
        initResponse = await paymentService.initializeDynamicServicesPayment(dynamicPayload)
        
      } else if (selectedPackage.isComboBundle) {
        // COMBO BUNDLE FLOW: Use dedicated combo initialize endpoint
        
        if (!selectedPackage.productId) {
          setVerificationError('Product ID is missing')
          console.error('[Payment] ❌ Product ID is missing from selectedPackage')
          return
        }
        
        if (!selectedPackage.price) {
          setVerificationError('Price is missing for combo bundle')
          console.error('[Payment] ❌ Price is missing from combo bundle')
          return
        }
        
        const comboPayload = {
          productId: String(selectedPackage.productId),
          amount: toCents(selectedPackage.price),  // Convert to CENTS (e.g., R150 → 15000)
          msisdn: null  // Payment-first, MSISDN allocated after payment
        }
        initResponse = await paymentService.initializeComboPayment(comboPayload)
        
      } else {
        // PREPAID FLOW: Regular packages (payment first, then subscriber creation)
        if (!selectedPackage.productId) {
          setVerificationError('Product ID is missing')
          console.error('[Payment] ❌ Product ID is missing from selectedPackage')
          return
        }
        
        const payload = {
          productId: String(selectedPackage.productId),
          msisdn: null  // Payment-first, MSISDN allocated after payment
        }
        initResponse = await paymentService.initializeTransaction(payload)
      }

      if (!initResponse.success || !initResponse.data) {
        setVerificationError(initResponse.error || 'Failed to initialize payment')
        return
      }
      // Use Paystack Popup with access_code
      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: (transaction: any) => {
          handlePaymentVerification(transaction.reference || initResponse.data?.reference || '')
        },
        onCancel: () => {
          setVerificationError(null)
        }
      })
    } catch (error: any) {
      console.error('[Payment] Initialization error:', error)
      setVerificationError(
        error.response?.data?.message || 
        error.message || 
        'Failed to initialize payment. Please try again.'
      )
    } finally {
      setIsInitializing(false)
    }
  }

  // Handle payment verification after Paystack success
  // NEW FLOW: Verify → Create Subscriber → Create Order/Services → Link Transaction → Paystack Subscription
  const handlePaymentVerification = async (reference: string) => {
    setIsVerifyingPayment(true)
    setVerificationError(null)
    
    try {
      const isSubscription = selectedPackage?.planChargeType === 'monthly'
      
      // STEP 1: Verify payment (no longer creates order automatically)
      const verifyResponse = await paymentService.verifyPayment({
        reference: reference,
        saveCard: isSubscription
      })
      
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Payment verification failed')
      }
      
      // STEP 2: Create subscriber (get MSISDN) - SKIP if already created in contract flow
      let newMsisdn: string
      
      if (allocatedMsisdn) {
        // Contract flow: Subscriber was already created before payment
        newMsisdn = allocatedMsisdn
      } else {
        // Prepaid flow: Create subscriber after payment
        if (!ricaData) {
          throw new Error('RICA data is required for subscriber creation')
        }
        
        const subscriberPayload = {
          productId: selectedPackage!.simPackageProductId!,  // SIM package ID ending with P (e.g., 7029225P)
          ...(selectedPackage!.simStatus === 'has-sim' && selectedPackage!.iccid 
            ? { iccid: selectedPackage!.iccid }
            : {}),
          eSim: false,
          address: [{
            referredType: 'SUBSCRIBER',
            addressType: 'INSTALLATION',
            ...ricaData.address,
            oneLineAddress: `${ricaData.address.streetNo} ${ricaData.address.streetName}, ${ricaData.address.city}`
          }]
        }
        
        console.log('[Payment] Subscriber payload:', subscriberPayload)
        const subscriberResponse = await subscriptionService.createSubscription(subscriberPayload)
        newMsisdn = subscriberResponse?.detail?.msisdn || subscriberResponse?.detail?.msisdnDisplay
        
        if (!newMsisdn) {
          throw new Error('Failed to allocate MSISDN')
        }
        console.log('[Payment] ✓ Subscriber created, MSISDN:', newMsisdn)
      }
      
      // Check if SIM is active
      console.log('[Payment] Checking SIM activation status...')
      const simStatus = await subscriptionService.checkSimActive(newMsisdn)
      console.log('[Payment] SIM Status:', {
        isActive: simStatus.isActive,
        hasPendingOrders: simStatus.hasPendingOrders,
        message: simStatus.message
      })
      
      if (simStatus.isActive) {
        console.log('[Payment] ✓ SIM is active - order will be created immediately')
      } else {
        console.log('[Payment] ⏳ SIM not yet active - order will be queued')
      }
      
      // STEP 3: Create order OR dynamic services (based on SIM active status)
      if (selectedPackage!.isDynamicPlan && selectedPackage!.planAllocation) {
        // Dynamic services flow
        const planAllocation = selectedPackage!.planAllocation!
        const expiryDate = getDefaultExpiryDate()
        
        if (!simStatus.isActive) {
          // SIM not active - store pending dynamic services
          
          const pendingServices = []
          if (planAllocation.data > 0) {
            const dataValue = convertRandsToServiceValue('DATA', planAllocation.data, selectedPackage!.packageType || 'prepaid')
            if (dataValue !== null) {
              pendingServices.push({
                definitionCode: 'DATA' as const,
                value: dataValue,
                priceInCents: planAllocation.data * 100,
                expiryDate,
                paymentReference: reference
              })
            }
          }
          if (planAllocation.voice > 0) {
            pendingServices.push({
              definitionCode: 'GPA_CREDIT' as const,
              value: planAllocation.voice,
              priceInCents: planAllocation.voice * 100,
              expiryDate,
              paymentReference: reference
            })
          }
          if (planAllocation.sms > 0) {
            const smsValue = convertRandsToServiceValue('SMS', planAllocation.sms, selectedPackage!.packageType || 'prepaid')
            if (smsValue !== null) {
              pendingServices.push({
                definitionCode: 'SMS' as const,
                value: smsValue,
                priceInCents: planAllocation.sms * 100,
                expiryDate,
                paymentReference: reference
              })
            }
          }
          if (planAllocation.whatsapp > 0) {
            const whatsappValue = convertRandsToServiceValue('WHATSAPP', planAllocation.whatsapp, selectedPackage!.packageType || 'prepaid')
            if (whatsappValue !== null) {
              pendingServices.push({
                definitionCode: 'WHATSAPP' as const,
                value: whatsappValue,
                priceInCents: planAllocation.whatsapp * 100,
                expiryDate,
                paymentReference: reference
              })
            }
          }
          
          // Store each pending service
          for (const service of pendingServices) {
            await subscriptionService.storePendingDynamicService(newMsisdn, service)
          }
          
        } else {
          // SIM is active - create services immediately
          const services = []
          
          if (planAllocation.data > 0) {
            const dataValue = convertRandsToServiceValue('DATA', planAllocation.data, selectedPackage!.packageType || 'prepaid')
            if (dataValue !== null) {
              services.push({
                value: dataValue,
                definitionCode: 'DATA' as const,
                expiryDate
              })
            }
          }
          if (planAllocation.voice > 0) {
            services.push({
              value: planAllocation.voice,
              definitionCode: 'GPA_CREDIT' as const,
              expiryDate
            })
          }
          if (planAllocation.sms > 0) {
            const smsValue = convertRandsToServiceValue('SMS', planAllocation.sms, selectedPackage!.packageType || 'prepaid')
            if (smsValue !== null) {
              services.push({
                value: smsValue,
                definitionCode: 'SMS' as const,
                expiryDate
              })
            }
          }
          if (planAllocation.whatsapp > 0) {
            const whatsappValue = convertRandsToServiceValue('WHATSAPP', planAllocation.whatsapp, selectedPackage!.packageType || 'prepaid')
            if (whatsappValue !== null) {
              services.push({
                value: whatsappValue,
                definitionCode: 'WHATSAPP' as const,
                expiryDate
              })
            }
          }
          
          const servicesResponse = await subscriptionService.createDynamicServices(newMsisdn, { services })
          const serviceIds = servicesResponse.results
            .filter(r => r.success && r.id)
            .map(r => r.id!)
          
          // STEP 4: Link transaction to services
          await paymentService.linkTransactionToServices({
            transactionReference: reference,
            serviceIds: serviceIds
          })
        }
        
      } else {
        // Regular order flow
        if (!simStatus.isActive) {
          // SIM not active - store pending order
          await subscriptionService.storePendingOrder({
            msisdn: newMsisdn,
            productId: selectedPackage!.productId,
            productAmount: selectedPackage!.price,
            paymentReference: reference
          })
          
        } else {
          // SIM is active - create order immediately
          const orderResponse = await subscriptionService.createOrder({
            products: [{ id: selectedPackage!.productId, amount: selectedPackage!.price }],
            msisdn: newMsisdn
          })
          
          if (orderResponse.orderId) {
            // Order created immediately - link transaction
            // STEP 4: Link transaction to order
            await paymentService.linkTransactionToOrder({
              transactionReference: reference,
              orderId: orderResponse.orderId
            })
          } else {
            throw new Error('Order creation failed - no orderId in response')
          }
        }
      }
      
      // STEP 5: Create recurring subscription if monthly
      if (isSubscription && verifyResponse.cardSaved) {
        const savedCards = await paymentService.getSavedCards()
        if (savedCards && savedCards.length > 0) {
          
          // Build services array from plan allocation
          const services: DynamicServicePaymentItem[] = []
          const expiryDate = getDefaultExpiryDate()
          
          if (selectedPackage!.planAllocation) {
            // CONTRACT OR PREPAID WITH ALLOCATION: Use plan allocation
            
            if (selectedPackage!.planAllocation.data > 0) {
              const dataValue = convertRandsToServiceValue('DATA', selectedPackage!.planAllocation.data, selectedPackage!.packageType || 'prepaid')
              if (dataValue !== null) {
                services.push({
                  value: dataValue,
                  definitionCode: 'DATA',
                  expiryDate,
                  priceInCents: selectedPackage!.planAllocation.data * 100
                })
              }
            }
            
            if (selectedPackage!.planAllocation.voice > 0) {
              services.push({
                value: selectedPackage!.planAllocation.voice,
                definitionCode: 'GPA_CREDIT',
                expiryDate,
                priceInCents: selectedPackage!.planAllocation.voice * 100
              })
            }
            
            if (selectedPackage!.planAllocation.sms > 0) {
              const smsValue = convertRandsToServiceValue('SMS', selectedPackage!.planAllocation.sms, selectedPackage!.packageType || 'prepaid')
              if (smsValue !== null) {
                services.push({
                  value: smsValue,
                  definitionCode: 'SMS',
                  expiryDate,
                  priceInCents: selectedPackage!.planAllocation.sms * 100
                })
              }
            }
            
            if (selectedPackage!.planAllocation.whatsapp && selectedPackage!.planAllocation.whatsapp > 0) {
              const whatsappValue = convertRandsToServiceValue('WHATSAPP', selectedPackage!.planAllocation.whatsapp, selectedPackage!.packageType || 'prepaid')
              if (whatsappValue !== null) {
                services.push({
                  value: whatsappValue,
                  definitionCode: 'WHATSAPP',
                  expiryDate,
                  priceInCents: selectedPackage!.planAllocation.whatsapp * 100
                })
              }
            }
          } else {
            // PREPAID WITHOUT ALLOCATION: Backend should derive services from productId
            // Create a placeholder service that backend will expand based on productId
            const priceInCents = selectedPackage!.priceInCents || selectedPackage!.price * 100
            services.push({
              value: priceInCents,
              definitionCode: 'PACKAGE',  // Backend recognizes this and expands to actual services
              expiryDate,
              priceInCents: priceInCents
            })
          }

          // Check if this is a combo bundle - use different endpoint
          if (selectedPackage!.isComboBundle) {
            const priceInCents = selectedPackage!.priceInCents || selectedPackage!.price * 100
            
            await paymentService.subscribeToComboBundle({
              productId: selectedPackage!.productId,
              msisdn: newMsisdn,
              paymentMethodId: savedCards[0].id,
              amount: priceInCents  // Already in cents
            })
          } else {
            if (services.length === 0) {
              throw new Error('No services defined for recurring subscription')
            }

            await paymentService.createDynamicServicesRecurring({
              msisdn: newMsisdn,
              paymentMethodId: savedCards[0].id,
              services
            })
          }
        }
      }
      
      setPaymentSuccess(true)
      // Notify Dashboard to refresh data after successful payment
      window.dispatchEvent(new CustomEvent('limes:payment-success'))
      setTimeout(() => {
        if (onPay) onPay()
        onClose()
      }, 2000)
      
    } catch (error: any) {
      console.error('[Payment] Error:', error)
      setVerificationError(error.message || 'Payment processing failed')
    } finally {
      setIsVerifyingPayment(false)
    }
  }

  const handleAddAddress = () => {
    if (!streetNo || !streetName || !city || !stateOrProvince || !postCode) {
      return
    }

    const newAddress: Address = {
      streetNo,
      streetName,
      suburb,
      city,
      stateOrProvince,
      postCode,
      country,
    }

    setAddresses([...addresses, newAddress])
    setSelectedAddressIndex(addresses.length)
    setShowAddAddress(false)
    
    // Reset form
    setStreetNo('')
    setStreetName('')
    setSuburb('')
    setCity('')
    setStateOrProvince('')
    setPostCode('')
    setCountry('South Africa')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-0 sm:mx-4 rounded-[28px] bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10 rounded-t-[28px]">
          <div>
            <div className="text-[20px] sm:text-[22px] font-semibold leading-[1.1]">
              Confirm SIM delivery
            </div>
            <div className="text-sm text-neutral-500 mt-0.5">
              Review your package and shipping details
            </div>
          </div>
          <button 
            aria-label="Close" 
            className="size-10 grid place-items-center rounded-xl text-neutral-500 hover:bg-neutral-100 text-2xl" 
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5 space-y-5">
            
            {/* Selected Package Section */}
            {selectedPackage && (
              <div className="space-y-3">
                <h3 className="text-neutral-900 font-medium text-[20px] leading-[1.1]">
                  Selected package
                </h3>
                <div className="rounded-[22px] border border-[#ABFF63] bg-[#EEFFD9] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`${import.meta.env.BASE_URL}images/lime-icon.png`}
                        alt=""
                        aria-hidden="true"
                        className="hidden sm:block h-8 w-8 select-none"
                      />
                      <div>
                        <div className="font-semibold text-[28px] leading-[1.05] tracking-tight text-neutral-900">
                          {selectedPackage.name}
                        </div>
                        <div className="text-sm text-neutral-600">Product ID: {selectedPackage.productId}</div>
                        {selectedPackage.simPackageProductId && (
                          <div className="text-sm text-neutral-600">SIM Package: {selectedPackage.simPackageProductId}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[28px] font-semibold leading-[1.05] text-neutral-900">
                        R{selectedPackage.price}
                      </div>
                      <div className="text-sm text-neutral-600">
                        {selectedPackage.planChargeType === 'once-off' ? 'Once-off payment' : 'First month (then auto-renews)'}
                      </div>
                      {selectedPackage.packageType && (
                        <div className="text-sm text-lime-700 font-semibold mt-1">
                          {selectedPackage.packageType === 'contract' ? 'Contract' : 'Prepaid'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Package Features - Dynamic Plan Allocation */}
                  {selectedPackage.isDynamicPlan && selectedPackage.planAllocation ? (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {selectedPackage.planAllocation.data > 0 && (
                        <div className="rounded-[18px] bg-[#ABFF63] p-4">
                          <div className="text-neutral-900 text-base">Mobile data</div>
                          <div className="text-neutral-900 font-semibold text-lg">R{selectedPackage.planAllocation.data}</div>
                        </div>
                      )}
                      {selectedPackage.planAllocation.voice > 0 && (
                        <div className="rounded-[18px] bg-[#ABFF63] p-4">
                          <div className="text-neutral-900 text-base">Airtime</div>
                          <div className="text-neutral-900 font-semibold text-lg">R{selectedPackage.planAllocation.voice}</div>
                        </div>
                      )}
                      {selectedPackage.planAllocation.sms > 0 && (
                        <div className="rounded-[18px] bg-[#ABFF63] p-4">
                          <div className="text-neutral-900 text-base">SMS</div>
                          <div className="text-neutral-900 font-semibold text-lg">R{selectedPackage.planAllocation.sms}</div>
                        </div>
                      )}
                      {selectedPackage.planAllocation.whatsapp > 0 && (
                        <div className="rounded-[18px] bg-[#ABFF63] p-4">
                          <div className="text-neutral-900 text-base">WhatsApp</div>
                          <div className="text-neutral-900 font-semibold text-lg">R{selectedPackage.planAllocation.whatsapp}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                  /* Package Features - Regular Bundle */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {selectedPackage.features?.mobileData && (
                      <div className="rounded-[18px] bg-[#ABFF63] p-4">
                        <div className="text-neutral-900 text-base">Mobile data</div>
                        <div className="text-neutral-900 font-semibold text-lg">{selectedPackage.features.mobileData}</div>
                      </div>
                    )}
                    {selectedPackage.features?.messaging && (
                      <div className="rounded-[18px] bg-[#ABFF63] p-4">
                        <div className="text-neutral-900 text-base">Messaging</div>
                        <div className="text-neutral-900 font-semibold text-lg">{selectedPackage.features.messaging}</div>
                      </div>
                    )}
                    {selectedPackage.features?.phone && (
                      <div className="rounded-[18px] bg-[#ABFF63] p-4">
                        <div className="text-neutral-900 text-base">Phone</div>
                        <div className="text-neutral-900 font-semibold text-lg">{selectedPackage.features.phone}</div>
                      </div>
                    )}
                    {selectedPackage.features?.airtime && (
                      <div className="rounded-[18px] bg-[#ABFF63] p-4">
                        <div className="text-neutral-900 text-base">Airtime</div>
                        <div className="text-neutral-900 font-semibold text-lg">{selectedPackage.features.airtime}</div>
                      </div>
                    )}
                  </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-neutral-900 font-medium text-[20px] leading-[1.1]">
                  Shipping address
                </h3>
                {!showAddAddress && (
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-lime-700 hover:text-lime-800"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Address
                  </button>
                )}
              </div>

              {/* Address List */}
              {!showAddAddress && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`rounded-[22px] border cursor-pointer transition-all ${
                        selectedAddressIndex === idx
                          ? 'border-[#ABFF63] bg-[#EEFFD9]'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      } p-4`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <img
                            src={`${import.meta.env.BASE_URL}images/location.png`}
                            alt=""
                            aria-hidden="true"
                            className="hidden sm:block h-10 w-10 select-none"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-neutral-900 text-[28px] leading-[1.05] mb-0.5">
                              {idx === 0 ? 'Default Address' : `Address ${idx + 1}`}
                            </div>
                            <div className="text-sm text-neutral-600 leading-relaxed">
                              {formatAddress(addr)}
                            </div>
                          </div>
                        </div>
                        {selectedAddressIndex === idx && (
                          <img
                            src={`${import.meta.env.BASE_URL}images/doc_success.png`}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 select-none"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Form */}
              {showAddAddress && (
                <div className="rounded-xl border-2 border-neutral-900 bg-neutral-50 p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-neutral-900">New Shipping Address</h4>
                    <button
                      onClick={() => setShowAddAddress(false)}
                      className="text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      label="Street Number"
                      value={streetNo}
                      onChange={(e) => setStreetNo(e.target.value)}
                    />
                    <TextField
                      label="Street Name"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                    />
                    <TextField
                      label="Suburb (Optional)"
                      value={suburb}
                      onChange={(e) => setSuburb(e.target.value)}
                    />
                    <TextField
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                    <TextField
                      label="State/Province"
                      value={stateOrProvince}
                      onChange={(e) => setStateOrProvince(e.target.value)}
                    />
                    <TextField
                      label="Post Code"
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                    />
                    <TextField
                      label="Country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleAddAddress}
                    disabled={!streetNo || !streetName || !city || !stateOrProvince || !postCode}
                    className="w-full bg-neutral-900 text-white py-2.5 px-4 rounded-xl font-semibold hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Save Address
                  </button>
                </div>
              )}

              {!showAddAddress && addresses.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <img
                    src={`${import.meta.env.BASE_URL}images/location.png`}
                    alt=""
                    aria-hidden="true"
                    className="hidden sm:block h-12 w-12 mx-auto mb-3 opacity-40 select-none"
                  />
                  <p className="text-sm">No addresses available. Please add one.</p>
                </div>
              )}
            </div>

            {/* Customer Details for Payment */}
            {!showAddAddress && addresses.length > 0 && selectedPackage && (
              <div className="space-y-3">
                <h3 className="text-neutral-900 font-medium text-[20px] leading-[1.1]">
                  Payment details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <TextField
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                  <TextField
                    label="Contact Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="27123456789"
                    className="md:col-span-2"
                  />
                </div>
                <div className="space-y-2">
                  {selectedPackage.planChargeType === 'monthly' && (
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-xs text-purple-800">
                      <strong>Monthly Subscription:</strong> You'll be charged today for Month 1. Your card will be saved and 
                      automatically charged monthly starting 1 month from today. You can cancel anytime.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Status Messages */}
            {verificationError && (
              <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">Payment Verification Failed</h4>
                  <p className="text-sm text-red-700">{verificationError}</p>
                </div>
              </div>
            )}

            {paymentSuccess && (
              <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">Payment Successful!</h4>
                  <p className="text-sm text-green-700">Your SIM card will be shipped to your address. Redirecting...</p>
                </div>
              </div>
            )}

            {isVerifyingPayment && (
              <div className="rounded-xl bg-blue-50 border-2 border-blue-200 p-4 flex items-start gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-1">Verifying Payment...</h4>
                  <p className="text-sm text-blue-700">Please wait while we confirm your payment with the bank.</p>
                </div>
              </div>
            )}

            {/* Summary & Pay Button */}
            {!showAddAddress && addresses.length > 0 && selectedPackage && (
              <div className="space-y-4 pt-2">
                <div className="rounded-[18px] bg-neutral-100 p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Package</span>
                    <span className="font-semibold text-neutral-900">R{selectedPackage.price}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-semibold text-lime-600">FREE</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-2 flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-base">Total</span>
                    <span className="font-semibold text-2xl text-lime-700">R{selectedPackage.price}</span>
                  </div>
                </div>

                {email && name && phone ? (
                  isInitializing || isVerifyingPayment || paymentSuccess ? (
                    <button 
                      disabled
                      className="w-full bg-neutral-300 text-neutral-600 py-3.5 px-4 rounded-xl font-bold cursor-not-allowed inline-flex items-center justify-center gap-2 text-lg"
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isInitializing && 'Initializing Payment...'}
                      {isVerifyingPayment && 'Verifying Payment...'}
                      {paymentSuccess && 'Payment Successful'}
                    </button>
                  ) : (
                    <button
                      onClick={handleInitializePayment}
                      className="w-full bg-[#ABFF63] text-neutral-900 py-3.5 px-4 rounded-[18px] font-semibold hover:brightness-95 active:scale-[0.99] transition inline-flex items-center justify-center gap-2 text-sm"
                    >
                      Pay now
                    </button>
                  )
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-neutral-600">Please fill in all payment details above</p>
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
