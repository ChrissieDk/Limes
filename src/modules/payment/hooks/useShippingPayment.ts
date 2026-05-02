import { useState } from 'react'
import { paymentService } from '../services/paymentService'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { buildServicesFromAllocation, convertRandsToServiceValue, getDefaultExpiryDate, toCents } from '../utils/dynamicPricing'
import { SHIPPING_COST_CENTS } from '../../../constants/shipping'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import type { SelectedPackage, RicaData } from '../../auth/components/ShippingModal'

declare const PaystackPop: any

export interface ShippingPaymentState {
  isInitializing: boolean
  isVerifyingPayment: boolean
  verificationError: string | null
  paymentSuccess: boolean
  refundRequested: boolean
  initializePayment: () => Promise<void>
}

export function useShippingPayment(
  selectedPackage: SelectedPackage | undefined,
  ricaData: RicaData | undefined,
  onPay: (() => void) | undefined,
  onClose: () => void
): ShippingPaymentState {
  const [isInitializing, setIsInitializing] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [refundRequested, setRefundRequested] = useState(false)

  const handlePaymentVerification = async (reference: string) => {
    setIsVerifyingPayment(true)
    setVerificationError(null)

    try {
      const isSubscription = selectedPackage?.planChargeType === 'monthly'

      const verifyResponse = await paymentService.verifyPayment({ reference, saveCard: isSubscription })
      if (!verifyResponse.success) {
        throw new Error(verifyResponse.error || 'Payment verification failed')
      }

      if (!ricaData) throw new Error('RICA data is required for subscriber creation')

      const subscriberPayload = {
        productId: selectedPackage!.simPackageProductId!,
        ...(selectedPackage!.simStatus === 'has-sim' && selectedPackage!.iccid ? { iccid: selectedPackage!.iccid } : {}),
        eSim: false,
        address: [{
          referredType: 'SUBSCRIBER' as const,
          addressType: 'INSTALLATION' as const,
          ...ricaData.address,
          oneLineAddress: `${ricaData.address.streetNo} ${ricaData.address.streetName}, ${ricaData.address.city}`,
        }],
      }

      let newMsisdn: string
      try {
        const subscriberResponse = await subscriptionService.createSubscription(subscriberPayload)
        newMsisdn = subscriberResponse?.detail?.msisdn || subscriberResponse?.detail?.msisdnDisplay
        if (!newMsisdn) throw new Error('Failed to allocate MSISDN')
      } catch (subscriberErr) {
        try {
          await paymentService.requestRefund({ transactionReference: reference, amountInCents: null, reason: 'MVNX subscriber creation failed' })
          setRefundRequested(true)
        } catch (refundErr) {
          console.error('[Payment] Refund request failed:', refundErr)
        }
        throw new Error('Subscriber creation failed. A refund has been requested and will be processed within 5-7 business days.')
      }

      const simStatus = await subscriptionService.checkSimActive(newMsisdn)

      if (selectedPackage!.isDynamicPlan && selectedPackage!.planAllocation) {
        await handleDynamicPlanFlow(newMsisdn, reference, simStatus.isActive)
      } else {
        await handleRegularOrderFlow(newMsisdn, reference, simStatus.isActive)
      }

      if (isSubscription && verifyResponse.cardSaved) {
        await handleRecurringSubscription(newMsisdn)
      }

      setPaymentSuccess(true)
      window.dispatchEvent(new CustomEvent('limes:payment-success'))
      setTimeout(() => { if (onPay) onPay(); onClose() }, 2000)
    } catch (error) {
      setVerificationError(getAxiosErrorMessage(error, 'Payment processing failed'))
    } finally {
      setIsVerifyingPayment(false)
    }
  }

  const handleDynamicPlanFlow = async (msisdn: string, reference: string, isActive: boolean) => {
    const planAllocation = selectedPackage!.planAllocation!
    const expiryDate = getDefaultExpiryDate()
    const pkgType = selectedPackage!.packageType || 'prepaid'

    const buildServices = () => {
      const services: Array<{ definitionCode: 'DATA' | 'GPA_CREDIT' | 'VOICE' | 'SMS' | 'WHATSAPP'; value: number; priceInCents: number; expiryDate: string; paymentReference: string }> = []
      const add = (key: 'data' | 'airtime' | 'voice' | 'sms' | 'whatsapp', code: typeof services[number]['definitionCode']) => {
        const value = convertRandsToServiceValue(key.toUpperCase() as 'DATA' | 'AIRTIME' | 'VOICE' | 'SMS' | 'WHATSAPP', planAllocation[key], pkgType)
        if (value !== null) services.push({ definitionCode: code, value, priceInCents: planAllocation[key] * 100, expiryDate, paymentReference: reference })
      }
      add('data', 'DATA')
      add('airtime', 'GPA_CREDIT')
      add('voice', 'VOICE')
      add('sms', 'SMS')
      add('whatsapp', 'WHATSAPP')
      return services
    }

    const allServices = buildServices()
    if (!isActive) {
      for (const service of allServices) {
        await subscriptionService.storePendingDynamicService(msisdn, service)
      }
    } else {
      const response = await subscriptionService.createDynamicServices(msisdn, {
        services: allServices.map((s) => ({ value: s.value, definitionCode: s.definitionCode, expiryDate: s.expiryDate })),
      })
      const serviceIds = response.results.filter((r) => r.success && r.id).map((r) => r.id!)
      if (serviceIds.length > 0) {
        await paymentService.linkTransactionToServices({ transactionReference: reference, serviceIds })
      }
    }
  }

  const handleRegularOrderFlow = async (msisdn: string, reference: string, isActive: boolean) => {
    if (!isActive) {
      await subscriptionService.storePendingOrder({ msisdn, productId: selectedPackage!.productId, productAmount: selectedPackage!.price, paymentReference: reference })
    } else {
      const orderResponse = await subscriptionService.createOrder({ products: [{ id: selectedPackage!.productId, amount: selectedPackage!.price }], msisdn })
      if (orderResponse.orderId) {
        await paymentService.linkTransactionToOrder({ transactionReference: reference, orderId: orderResponse.orderId })
      } else {
        throw new Error('Order creation failed - no orderId in response')
      }
    }
  }

  const handleRecurringSubscription = async (msisdn: string) => {
    const savedCards = await paymentService.getSavedCards()
    if (!savedCards?.length) return

    const expiryDate = getDefaultExpiryDate()
    let services = selectedPackage!.planAllocation
      ? buildServicesFromAllocation(selectedPackage!.planAllocation, selectedPackage!.packageType || 'prepaid')
      : []

    if (services.length === 0) {
      const priceInCents = selectedPackage!.priceInCents || selectedPackage!.price * 100
      services.push({ value: priceInCents, definitionCode: 'PACKAGE', expiryDate, priceInCents })
    }

    if (selectedPackage!.isComboBundle) {
      const priceInCents = selectedPackage!.priceInCents || selectedPackage!.price * 100
      await paymentService.subscribeToComboBundle({ productId: selectedPackage!.productId, msisdn, paymentMethodId: savedCards[0].id, amount: priceInCents })
    } else {
      if (services.length === 0) throw new Error('No services defined for recurring subscription')
      await paymentService.createDynamicServicesRecurring({ msisdn, paymentMethodId: savedCards[0].id, services })
    }
  }

  const initializePayment = async () => {
    if (!selectedPackage) {
      setVerificationError('Please select a package')
      return
    }

    setIsInitializing(true)
    setVerificationError(null)

    try {
      let initResponse: { success: boolean; data?: { access_code: string; reference: string }; error?: string }

      if (selectedPackage.packageType === 'contract' && selectedPackage.isDynamicPlan && selectedPackage.planAllocation) {
        if (!ricaData) { setVerificationError('RICA data is required for contract plans'); return }
        if (!selectedPackage.simPackageProductId) { setVerificationError('SIM package product ID is required'); return }
        const services = buildServicesFromAllocation(selectedPackage.planAllocation, selectedPackage.packageType || 'prepaid')
        initResponse = await paymentService.initializeDynamicServicesPayment({
          msisdn: null as unknown as string,
          services,
          ...(selectedPackage.simStatus === 'needs-sim' && { shippingCostInCents: SHIPPING_COST_CENTS }),
        })
      } else if (selectedPackage.isComboBundle) {
        if (!selectedPackage.productId || !selectedPackage.price) { setVerificationError('Product ID and price are required'); return }
        initResponse = await paymentService.initializeTransaction({
          productId: String(selectedPackage.productId),
          amount: toCents(selectedPackage.price) + (selectedPackage.simStatus === 'needs-sim' ? SHIPPING_COST_CENTS : 0),
          msisdn: null,
        })
      } else {
        if (!selectedPackage.productId || !selectedPackage.price) { setVerificationError('Product ID and price are required'); return }
        initResponse = await paymentService.initializeTransaction({
          productId: String(selectedPackage.productId),
          msisdn: null,
          amount: toCents(selectedPackage.price) + (selectedPackage.simStatus === 'needs-sim' ? SHIPPING_COST_CENTS : 0),
        })
      }

      if (!initResponse.success || !initResponse.data) {
        setVerificationError(initResponse.error || 'Failed to initialize payment')
        return
      }

      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: (transaction: Record<string, unknown>) => {
          handlePaymentVerification(String(transaction.reference || initResponse.data?.reference || ''))
        },
        onCancel: () => setVerificationError(null),
      })
    } catch (error) {
      setVerificationError(getAxiosErrorMessage(error, 'Failed to initialize payment. Please try again.'))
    } finally {
      setIsInitializing(false)
    }
  }

  return { isInitializing, isVerifyingPayment, verificationError, paymentSuccess, refundRequested, initializePayment }
}
