import { useState } from 'react'
import { paymentService } from '../services/paymentService'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { log } from '../../../lib/sentry-logger'
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
      log.info('payment_verification_started', {
        reference,
        package_type: selectedPackage?.packageType || 'null',
        plan_charge_type: selectedPackage?.planChargeType || 'null',
        is_subscription: isSubscription,
        amount_cents: selectedPackage?.priceInCents || selectedPackage?.price ? toCents(selectedPackage!.price) : 0,
      })

      const verifyResponse = await paymentService.verifyPayment({ reference, saveCard: isSubscription })
      if (!verifyResponse.success) {
        log.error('payment_verification_failed', { reference, error: verifyResponse.error || 'unknown' })
        throw new Error(verifyResponse.error || 'Payment verification failed')
      }
      log.info('payment_verified', { reference, card_saved: verifyResponse.cardSaved ?? false })

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
        log.info('subscriber_created', { reference, msisdn: newMsisdn })
      } catch (subscriberErr) {
        log.error('subscriber_creation_failed', { reference, error: String(subscriberErr) })
        try {
          await paymentService.requestRefund({ transactionReference: reference, amountInCents: null, reason: 'MVNX subscriber creation failed' })
          setRefundRequested(true)
          log.info('refund_requested', { reference, reason: 'subscriber_creation_failed' })
        } catch (refundErr) {
          log.error('refund_request_failed', { reference, error: String(refundErr) })
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
      log.info('payment_success', {
        reference,
        msisdn: newMsisdn,
        package_type: selectedPackage?.packageType || 'null',
        plan_charge_type: selectedPackage?.planChargeType || 'null',
        amount_cents: selectedPackage?.priceInCents || selectedPackage?.price ? toCents(selectedPackage!.price) : 0,
        is_subscription: isSubscription,
      })
      window.dispatchEvent(new CustomEvent('limes:payment-success'))
      setTimeout(() => { if (onPay) onPay(); onClose() }, 2000)
    } catch (error) {
      const errMsg = getAxiosErrorMessage(error, 'Payment processing failed')
      log.error('payment_processing_failed', { reference, error: errMsg })
      setVerificationError(errMsg)
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
      log.warn('payment_init_no_package', { reason: 'no_package_selected' })
      return
    }

    setIsInitializing(true)
    setVerificationError(null)

    try {
      let initResponse: { success: boolean; data?: { access_code: string; reference: string }; error?: string }

      const baseLogAttrs = {
        product_id: selectedPackage.productId || 'null',
        package_type: selectedPackage.packageType || 'null',
        plan_charge_type: selectedPackage.planChargeType || 'null',
        price_cents: toCents(selectedPackage.price) + (selectedPackage.simStatus === 'needs-sim' ? SHIPPING_COST_CENTS : 0),
        sim_status: selectedPackage.simStatus || 'null',
        is_dynamic_plan: !!selectedPackage.isDynamicPlan,
        is_combo_bundle: !!selectedPackage.isComboBundle,
      }

      if (selectedPackage.packageType === 'contract' && selectedPackage.isDynamicPlan && selectedPackage.planAllocation) {
        if (!ricaData) { setVerificationError('RICA data is required for contract plans'); log.warn('payment_init_failed', { ...baseLogAttrs, reason: 'rica_data_missing' }); return }
        if (!selectedPackage.simPackageProductId) { setVerificationError('SIM package product ID is required'); log.warn('payment_init_failed', { ...baseLogAttrs, reason: 'sim_package_product_id_missing' }); return }
        const services = buildServicesFromAllocation(selectedPackage.planAllocation, selectedPackage.packageType || 'prepaid')
        log.info('payment_initializing', { ...baseLogAttrs, flow: 'dynamic_services' })
        initResponse = await paymentService.initializeDynamicServicesPayment({
          msisdn: null as unknown as string,
          services,
          ...(selectedPackage.simStatus === 'needs-sim' && { shippingCostInCents: SHIPPING_COST_CENTS }),
        })
      } else if (selectedPackage.isComboBundle) {
        if (!selectedPackage.productId || !selectedPackage.price) { setVerificationError('Product ID and price are required'); log.warn('payment_init_failed', { ...baseLogAttrs, reason: 'product_id_or_price_missing' }); return }
        log.info('payment_initializing', { ...baseLogAttrs, flow: 'combo_bundle' })
        initResponse = await paymentService.initializeTransaction({
          productId: String(selectedPackage.productId),
          amount: toCents(selectedPackage.price) + (selectedPackage.simStatus === 'needs-sim' ? SHIPPING_COST_CENTS : 0),
          msisdn: null,
        })
      } else {
        if (!selectedPackage.productId || !selectedPackage.price) { setVerificationError('Product ID and price are required'); log.warn('payment_init_failed', { ...baseLogAttrs, reason: 'product_id_or_price_missing' }); return }
        log.info('payment_initializing', { ...baseLogAttrs, flow: 'standard' })
        initResponse = await paymentService.initializeTransaction({
          productId: String(selectedPackage.productId),
          msisdn: null,
          amount: toCents(selectedPackage.price) + (selectedPackage.simStatus === 'needs-sim' ? SHIPPING_COST_CENTS : 0),
        })
      }

      if (!initResponse.success || !initResponse.data) {
        log.error('payment_init_failed', { ...baseLogAttrs, error: initResponse.error || 'unknown' })
        setVerificationError(initResponse.error || 'Failed to initialize payment')
        return
      }

      log.info('payment_initialized', { ...baseLogAttrs, reference: initResponse.data.reference || 'null' })

      const popup = new PaystackPop()
      popup.resumeTransaction(initResponse.data.access_code, {
        onSuccess: (transaction: Record<string, unknown>) => {
          handlePaymentVerification(String(transaction.reference || initResponse.data?.reference || ''))
        },
        onCancel: () => {
          log.warn('payment_cancelled_by_user', { ...baseLogAttrs, reference: initResponse.data?.reference || 'null' })
          setVerificationError(null)
        },
      })
    } catch (error) {
      const errMsg = getAxiosErrorMessage(error, 'Failed to initialize payment. Please try again.')
      log.error('payment_init_exception', { error: errMsg })
      setVerificationError(errMsg)
    } finally {
      setIsInitializing(false)
    }
  }

  return { isInitializing, isVerifyingPayment, verificationError, paymentSuccess, refundRequested, initializePayment }
}
