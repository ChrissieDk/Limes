import { useEffect, useState, useRef, useCallback } from 'react'
import { subscriptionService } from '../../subscription/services/subscriptionService'
import { crmService } from '../../crm/services/crmService'
import { userService } from '../services/userService'
import { paymentService } from '../../payment/services/paymentService'
import type { RicaAddress } from '../../../types'
import type { SimCard, Transaction } from '../components/dashboard/dashboardTypes'
import { mockSimCards } from '../components/dashboard/dashboardMocks'

/**
 * Fallback helper to infer package type from productId until the backend
 * returns an explicit `packageType` field on MsisdnData.
 *
 * BACKEND TODO: Once `MsisdnData.packageType` is available from the API,
 * this helper can be removed.
 *
 * NOTE: This only catches users whose current productId still matches the
 * initial SIM package IDs (ending in P). Users who purchased bundles after
 * activation will have different productIds and won't be detected correctly.
 */
function inferPackageType(productId: string): 'prepaid' | 'contract' | undefined {
  const prepaidSimPackageIds = ['7029225P', '7025225P']
  const contractSimPackageIds = ['7027225P', '7023225P', '7024225P']

  if (prepaidSimPackageIds.includes(productId)) return 'prepaid'
  if (contractSimPackageIds.includes(productId)) return 'contract'
  return undefined
}

export interface DashboardData {
  simCards: SimCard[]
  setSimCards: React.Dispatch<React.SetStateAction<SimCard[]>>
  balancesLoading: boolean
  transactions: Transaction[]
  transactionsLoading: boolean
  customerAddress: RicaAddress | null
  customerEmail: string
  customerName: string
  customerPhone: string
  ricaComplete: boolean
  ricaStatusChecked: boolean
  canActivate: Record<string, boolean>
  setCanActivate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  simIsActive: Record<string, boolean>
  setSimIsActive: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  activationStatusLoading: boolean
  refresh: () => void
}

export function useDashboardData(currentSimIndex: number): DashboardData {
  const [simCards, setSimCards] = useState<SimCard[]>(mockSimCards)
  const [balancesLoading, setBalancesLoading] = useState(true)
  const [customerAddress, setCustomerAddress] = useState<RicaAddress | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [ricaComplete, setRicaComplete] = useState(false)
  const [ricaStatusChecked, setRicaStatusChecked] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)
  const [canActivate, setCanActivate] = useState<Record<string, boolean>>({})
  const [simIsActive, setSimIsActive] = useState<Record<string, boolean>>({})
  const [activationStatusLoading, setActivationStatusLoading] = useState(true)

  const balancesFetchedForRef = useRef('')
  const activationPollInFlightRef = useRef(false)

  const refresh = useCallback(() => {
    balancesFetchedForRef.current = ''

    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser()

        if (user.msisdns && user.msisdns.length > 0) {
          setSimCards((prev) =>
            user.msisdns!.map((msisdnData, index: number) => {
              const msisdn = msisdnData.msisdn
              const existing = prev.find((s) => s.phoneNumber === msisdn)
              return {
                id: String(index + 1),
                name: msisdnData.simDescription ?? `Sim ${index + 1}`,
                phoneNumber: msisdn,
                isActive: msisdnData.hasActiveSubscription,
                hasVoiceTopUp: existing?.hasVoiceTopUp ?? false,
                productId: msisdnData.productId,
                packageType: msisdnData.packageType ?? inferPackageType(msisdnData.productId),
                plan: existing?.plan ?? {
                  mobileData: '0GB',
                  airtime: 'R0',
                  messaging: '0SMS',
                  phone: '0 Min',
                },
              }
            })
          )
        }

        const txResponse = await paymentService.getTransactionHistory(1, 10)
        setTransactions(txResponse)
      } catch (err) {
        console.error('[Dashboard] Error refreshing data after payment:', err)
      }
    }

    fetchUserData()
  }, [])

  // Fetch RICA status and user MSISDNs
  useEffect(() => {
    let cancelled = false
    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser()
        if (!cancelled) {
          setRicaComplete(user.ricaComplete ?? false)

          if (user.msisdns && user.msisdns.length > 0) {
            const updatedSimCards = user.msisdns.map((msisdnData, index: number) => ({
              id: String(index + 1),
              name: msisdnData.simDescription ?? `Sim ${index + 1}`,
              phoneNumber: msisdnData.msisdn,
              isActive: msisdnData.hasActiveSubscription,
              hasVoiceTopUp: false,
              productId: msisdnData.productId,
              packageType: msisdnData.packageType ?? inferPackageType(msisdnData.productId),
              plan: {
                mobileData: '0GB',
                airtime: 'R0',
                messaging: '0SMS',
                phone: '0 Min',
              },
            }))
            setSimCards(updatedSimCards)

            // Seed isActive from user data — eliminates the need for a batch check
            const initialSimIsActive: Record<string, boolean> = {}
            user.msisdns.forEach((md) => {
              initialSimIsActive[md.msisdn] = md.hasActiveSubscription
            })
            setSimIsActive(initialSimIsActive)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Dashboard] Error fetching user data:', err)
          setRicaComplete(false)
        }
      } finally {
        if (!cancelled) {
          setRicaStatusChecked(true)
          setActivationStatusLoading(false)
        }
      }
    }
    fetchUserData()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch transactions
  useEffect(() => {
    let cancelled = false
    const fetchTransactions = async () => {
      setTransactionsLoading(true)
      try {
        const response = await paymentService.getTransactionHistory(1, 10)
        if (!cancelled) {
          setTransactions(response)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Transactions] Error fetching transactions:', err)
        }
      } finally {
        if (!cancelled) setTransactionsLoading(false)
      }
    }
    fetchTransactions()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch account customer details
  useEffect(() => {
    let cancelled = false
    const fetchAccountCustomer = async () => {
      try {
        const response = await crmService.getAccountCustomer()
        if (cancelled) return

        // Defensive parsing: the backend returns varying shapes.
        // The PATCH endpoint updates `customer.address`, so we read that first.
        // Fallback to top-level `address` for backward compatibility.
        const customerAddr = response.customer?.address?.[0] ?? null
        const topLevelFallback = response.address?.[0] ?? null
        const primaryAddress = customerAddr ?? topLevelFallback

        if (primaryAddress) {
          setCustomerAddress(primaryAddress)
        }

        setCustomerEmail(response.detail?.billMedia?.emailAddress ?? '')
        setCustomerName(
          `${response.detail?.firstname ?? ''} ${response.detail?.lastname ?? ''}`.trim()
        )
        setCustomerPhone(response.phone?.phoneNumber ?? '')
      } catch (err) {
        if (!cancelled) console.error('[Account] Error fetching customer details:', err)
      }
    }
    fetchAccountCustomer()

    // Refetch when the tab regains focus so edits made on other pages
    // (e.g. Edit Details) are reflected immediately.
    const onVisible = () => {
      if (!document.hidden) fetchAccountCustomer()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  // Fetch balances for the currently selected SIM
  useEffect(() => {
    let cancelled = false
    const fetchBalances = async () => {
      if (simCards.length === 0 || !simCards[currentSimIndex]?.phoneNumber) {
        setBalancesLoading(false)
        return
      }

      const msisdnToFetch = simCards[currentSimIndex].phoneNumber

      if (balancesFetchedForRef.current === msisdnToFetch) {
        setBalancesLoading(false)
        return
      }

      setBalancesLoading(true)

      try {
        const response = await subscriptionService.getBalances(msisdnToFetch)
        if (!cancelled && response.balances) {
          balancesFetchedForRef.current = msisdnToFetch

          setSimCards((prevSims) =>
            prevSims.map((sim, idx) => {
              if (idx === currentSimIndex) {
                return {
                  ...sim,
                  balances: response.balances,
                  plan: {
                    ...sim.plan,
                    mobileData:
                      response.balances.find((b) => b.grouping === 'data')?.formattedParts?.value ||
                      sim.plan.mobileData,
                    airtime:
                      response.balances.find(
                        (b) => b.grouping === 'gpa' && b.definitionCode === 'GPA_CREDIT'
                      )?.formattedParts?.value || sim.plan.airtime,
                  },
                }
              }
              return sim
            })
          )
        }
      } catch (err) {
        if (!cancelled) console.error('[Balance] Error fetching balances:', err)
      } finally {
        if (!cancelled) setBalancesLoading(false)
      }
    }
    fetchBalances()
    return () => {
      cancelled = true
    }
  }, [simCards, currentSimIndex])

  // Lightweight activation status refresh for the currently viewed SIM
  useEffect(() => {
    const msisdn = simCards[currentSimIndex]?.phoneNumber
    if (!msisdn) return

    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      if (document.hidden) return
      if (activationPollInFlightRef.current) return

      activationPollInFlightRef.current = true
      try {
        const response = await subscriptionService.checkSimActive(msisdn)
        if (cancelled) return

        setCanActivate((prev) => ({
          ...prev,
          [msisdn]:
            response.isActive &&
            (response.hasPendingOrders || response.hasPendingDynamicServices || false),
        }))
        setSimIsActive((prev) => ({
          ...prev,
          [msisdn]: response.isActive,
        }))
      } catch {
        // Silent in background; initial activation checker already logs errors
      } finally {
        activationPollInFlightRef.current = false
      }
    }

    tick()
    const id = window.setInterval(tick, 45_000)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [simCards, currentSimIndex])

  return {
    simCards,
    setSimCards,
    balancesLoading,
    transactions,
    transactionsLoading,
    customerAddress,
    customerEmail,
    customerName,
    customerPhone,
    ricaComplete,
    ricaStatusChecked,
    canActivate,
    setCanActivate,
    simIsActive,
    setSimIsActive,
    activationStatusLoading,
    refresh,
  }
}
