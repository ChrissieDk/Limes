import { useEffect, useState, useRef, useCallback } from "react";
import { subscriptionService } from "../../subscription/services/subscriptionService";
import { crmService } from "../../crm/services/crmService";
import { userService } from "../services/userService";
import { paymentService } from "../../payment/services/paymentService";
import type { RicaAddress } from "../../../types";
import type {
  SimCard,
  Transaction,
} from "../components/dashboard/dashboardTypes";

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
function inferPackageType(
  productId: string,
): "prepaid" | "contract" | undefined {
  const prepaidSimPackageIds = ["7029225P", "7025225P"];
  const contractSimPackageIds = ["7027225P", "7023225P", "7024225P"];

  if (prepaidSimPackageIds.includes(productId)) return "prepaid";
  if (contractSimPackageIds.includes(productId)) return "contract";
  return undefined;
}

export interface DashboardData {
  simCards: SimCard[];
  setSimCards: React.Dispatch<React.SetStateAction<SimCard[]>>;
  balancesLoading: boolean;
  transactions: Transaction[];
  transactionsLoading: boolean;
  customerAddress: RicaAddress | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  ricaComplete: boolean;
  ricaStatusChecked: boolean;
  canActivate: Record<string, boolean>;
  setCanActivate: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  simIsActive: Record<string, boolean>;
  setSimIsActive: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activationStatusLoading: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  refreshBalances: () => void;
  error: string | null;
  isOffline: boolean;
  isShowingCachedData: boolean;
}

export function useDashboardData(currentSimIndex: number): DashboardData {
  const [simCards, setSimCards] = useState<SimCard[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [customerAddress, setCustomerAddress] = useState<RicaAddress | null>(
    null,
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [ricaComplete, setRicaComplete] = useState(false);
  const [ricaStatusChecked, setRicaStatusChecked] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [canActivate, setCanActivate] = useState<Record<string, boolean>>({});
  const [simIsActive, setSimIsActive] = useState<Record<string, boolean>>({});
  const [activationStatusLoading, setActivationStatusLoading] = useState(true);
  const [forceBalanceRefresh, setForceBalanceRefresh] = useState(0);

  const balancesFetchedForRef = useRef("");
  const activationPollInFlightRef = useRef(false);
  const crmLastFetchedRef = useRef(0);
  const DASHBOARD_CACHE_KEY = "limes:dashboard:cached";
  const TRANSACTIONS_CACHE_KEY = "limes:dashboard:transactions";
  const TRANSACTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== "undefined" && !navigator.onLine,
  );
  const [isShowingCachedData, setIsShowingCachedData] = useState(false);

  /** Persist current dashboard data to localStorage for offline fallback. */
  const persistDashboardSnapshot = useCallback(() => {
    try {
      const snapshot = {
        simCards,
        transactions,
        customerAddress,
        customerEmail,
        customerName,
        customerPhone,
        ricaComplete,
        timestamp: Date.now(),
      };
      localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(snapshot));
    } catch {
      // localStorage full or unavailable
    }
  }, [
    simCards,
    transactions,
    customerAddress,
    customerEmail,
    customerName,
    customerPhone,
    ricaComplete,
  ]);

  /**
   * Load the last-known-good dashboard snapshot from localStorage.
   * Returns true if data was loaded, false if no cache exists.
   */
  const loadCachedDashboard = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (!raw) return false;
      const cached = JSON.parse(raw);
      if (cached.simCards) setSimCards(cached.simCards);
      if (cached.transactions) setTransactions(cached.transactions);
      if (cached.customerAddress) setCustomerAddress(cached.customerAddress);
      if (cached.customerEmail) setCustomerEmail(cached.customerEmail);
      if (cached.customerName) setCustomerName(cached.customerName);
      if (cached.customerPhone) setCustomerPhone(cached.customerPhone);
      if (typeof cached.ricaComplete === "boolean")
        setRicaComplete(cached.ricaComplete);
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshBalances = useCallback(() => {
    balancesFetchedForRef.current = "";
    setForceBalanceRefresh((k) => k + 1);
  }, []);

  const refresh = useCallback(async () => {
    balancesFetchedForRef.current = "";

    // Invalidate transaction cache so payment-success shows fresh data
    try {
      sessionStorage.removeItem(TRANSACTIONS_CACHE_KEY);
    } catch {
      // no-op
    }

    try {
      setError(null);
      const user = await userService.getCurrentUser();

      if (user.msisdns && user.msisdns.length > 0) {
        setSimCards((prev) =>
          user.msisdns!.map((msisdnData, index: number) => {
            const msisdn = msisdnData.msisdn;
            const existing = prev.find((s) => s.phoneNumber === msisdn);
            return {
              id: String(index + 1),
              name: msisdnData.simDescription ?? `Sim ${index + 1}`,
              phoneNumber: msisdn,
              isActive: msisdnData.hasActiveSubscription,
              hasVoiceTopUp: existing?.hasVoiceTopUp ?? false,
              productId: msisdnData.productId,
              packageType:
                msisdnData.packageType ??
                inferPackageType(msisdnData.productId),
              balances: existing?.balances,
              plan: existing?.plan ?? {
                mobileData: "0GB",
                airtime: "R0",
                messaging: "0SMS",
                phone: "0 Min",
              },
            };
          }),
        );
      }

      const txResponse = await paymentService.getTransactionHistory(1, 10);
      setTransactions(txResponse);
    } catch (err) {
      console.error("[Dashboard] Error refreshing data after payment:", err);
    }
  }, []);

  // Fetch RICA status and user MSISDNs, with offline fallback
  useEffect(() => {
    let cancelled = false;
    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser();
        if (!cancelled) {
          setRicaComplete(user.ricaComplete ?? false);

          if (user.msisdns && user.msisdns.length > 0) {
            const updatedSimCards = user.msisdns.map(
              (msisdnData, index: number) => ({
                id: String(index + 1),
                name: msisdnData.simDescription ?? `Sim ${index + 1}`,
                phoneNumber: msisdnData.msisdn,
                isActive: msisdnData.hasActiveSubscription,
                hasVoiceTopUp: false,
                productId: msisdnData.productId,
                packageType:
                  msisdnData.packageType ??
                  inferPackageType(msisdnData.productId),
                plan: {
                  mobileData: "0GB",
                  airtime: "R0",
                  messaging: "0SMS",
                  phone: "0 Min",
                },
              }),
            );
            setSimCards(updatedSimCards);
            setError(null);

            // NOTE: We deliberately do NOT seed simIsActive from hasActiveSubscription.
            // hasActiveSubscription reflects whether the user has a billing subscription,
            // NOT whether the SIM is active on the network. Prepaid users would falsely
            // appear inactive. We let the polling loop below truth every SIM from the API.
          }

          // Persist to localStorage for offline fallback
          persistDashboardSnapshot();
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Dashboard] Error fetching user data:", err);

          // If offline, try to show cached data instead of error
          if (isOffline && loadCachedDashboard()) {
            setIsShowingCachedData(true);
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Failed to load your account. Please try again.",
            );
            setRicaComplete(false);
          }
        }
      } finally {
        if (!cancelled) {
          setRicaStatusChecked(true);
        }
      }
    };
    fetchUserData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch transactions with sessionStorage cache
  useEffect(() => {
    let cancelled = false;
    const fetchTransactions = async () => {
      setTransactionsLoading(true);

      // Try cache first
      try {
        const cached = sessionStorage.getItem(TRANSACTIONS_CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < TRANSACTIONS_CACHE_TTL) {
            if (!cancelled) {
              setTransactions(data);
              setTransactionsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Cache parse failure — proceed to fetch
      }

      try {
        const response = await paymentService.getTransactionHistory(1, 10);
        if (!cancelled) {
          setTransactions(response);
          try {
            sessionStorage.setItem(
              TRANSACTIONS_CACHE_KEY,
              JSON.stringify({ data: response, timestamp: Date.now() }),
            );
          } catch {
            // sessionStorage full or unavailable
          }
          persistDashboardSnapshot();
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Transactions] Error fetching transactions:", err);
          // If offline and first fetch failed, try cached data
          if (isOffline && loadCachedDashboard()) {
            setIsShowingCachedData(true);
          }
        }
      } finally {
        if (!cancelled) setTransactionsLoading(false);
      }
    };
    fetchTransactions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch account customer details
  useEffect(() => {
    let cancelled = false;
    const fetchAccountCustomer = async () => {
      try {
        const response = await crmService.getAccountCustomer();
        if (cancelled) return;

        // Defensive parsing: the backend returns varying shapes.
        // The PATCH endpoint updates `customer.address`, so we read that first.
        // Fallback to top-level `address` for backward compatibility.
        const customerAddr = response.customer?.address?.[0] ?? null;
        const topLevelFallback = response.address?.[0] ?? null;
        const primaryAddress = customerAddr ?? topLevelFallback;

        if (primaryAddress) {
          setCustomerAddress(primaryAddress);
        }

        setCustomerEmail(response.detail?.billMedia?.emailAddress ?? "");
        setCustomerName(
          `${response.detail?.firstname ?? ""} ${response.detail?.lastname ?? ""}`.trim(),
        );
        setCustomerPhone(response.phone?.phoneNumber ?? "");
      } catch (err) {
        if (!cancelled)
          console.error("[Account] Error fetching customer details:", err);
      }
    };
    fetchAccountCustomer();

    // Refetch when the tab regains focus so edits made on other pages
    // (e.g. Edit Details) are reflected immediately.
    // Debounced: at most once per 30s to avoid API thundering herd.
    const onVisible = () => {
      if (document.hidden) return;
      const now = Date.now();
      if (now - crmLastFetchedRef.current < 30_000) return;
      crmLastFetchedRef.current = now;
      fetchAccountCustomer();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Fetch balances for the currently selected SIM
  // Aborts in-flight request when SIM selection changes to avoid stale updates.
  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    const fetchBalances = async () => {
      if (simCards.length === 0 || !simCards[currentSimIndex]?.phoneNumber) {
        setBalancesLoading(false);
        return;
      }

      const msisdnToFetch = simCards[currentSimIndex].phoneNumber;

      if (balancesFetchedForRef.current === msisdnToFetch) {
        setBalancesLoading(false);
        return;
      }

      setBalancesLoading(true);

      try {
        const response = await subscriptionService.getBalances(msisdnToFetch, {
          signal: abortController.signal,
        });
        if (!cancelled && response.balances) {
          balancesFetchedForRef.current = msisdnToFetch;

          setSimCards((prevSims) =>
            prevSims.map((sim, idx) => {
              if (idx === currentSimIndex) {
                return {
                  ...sim,
                  balances: response.balances,
                  plan: {
                    ...sim.plan,
                    mobileData:
                      response.balances.find((b) => b.grouping === "data")
                        ?.formattedParts?.value || sim.plan.mobileData,
                    airtime:
                      response.balances.find(
                        (b) =>
                          b.grouping === "gpa" &&
                          b.definitionCode === "GPA_CREDIT",
                      )?.formattedParts?.value || sim.plan.airtime,
                  },
                };
              }
              return sim;
            }),
          );
          setError(null);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (!cancelled)
          console.error("[Balance] Error fetching balances:", err);
      } finally {
        if (!cancelled) setBalancesLoading(false);
      }
    };

    fetchBalances();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [simCards, currentSimIndex, forceBalanceRefresh]);

  // Lightweight activation status refresh for the currently viewed SIM only.
  // Stops polling once the SIM is confirmed active with no pending items.
  useEffect(() => {
    const msisdn =
      currentSimIndex >= 0 && simCards[currentSimIndex]?.phoneNumber;
    if (!msisdn) return;

    let cancelled = false;
    let intervalId: number | null = null;

    const tick = async () => {
      if (cancelled) return;
      if (document.hidden) return;
      if (activationPollInFlightRef.current) return;

      activationPollInFlightRef.current = true;
      try {
        const result = await subscriptionService.checkSimActive(msisdn);
        if (cancelled) return;

        setCanActivate((prev) => ({
          ...prev,
          [msisdn]:
            result.isActive &&
            (result.hasPendingOrders ||
              result.hasPendingDynamicServices ||
              false),
        }));
        setSimIsActive((prev) => ({
          ...prev,
          [msisdn]: result.isActive,
        }));

        // Stop polling when active with no pending items
        if (
          result.isActive &&
          !result.hasPendingOrders &&
          !result.hasPendingDynamicServices &&
          intervalId !== null
        ) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        // Silent in background; initial activation checker already logs errors
      } finally {
        activationPollInFlightRef.current = false;
        if (!cancelled) setActivationStatusLoading(false);
      }
    };

    tick();
    // Use longer interval on mobile to save battery/data
    const isMobile = window.innerWidth < 1024;
    const interval = isMobile ? 180_000 : 45_000;
    intervalId = window.setInterval(tick, interval);

    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSimIndex, simCards.map((s) => s.phoneNumber).join(",")]);

  // Track online/offline status for offline UX
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

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
    isLoading:
      balancesLoading || transactionsLoading || activationStatusLoading,
    refresh,
    refreshBalances,
    error,
    isOffline,
    isShowingCachedData,
  };
}
