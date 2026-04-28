import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { AlertCircle, ChevronLeft, ExternalLink, Loader2, Package } from 'lucide-react'

import DashboardNavbar from '../components/DashboardNavbar'
import Footer from '../components/Footer'
import { ShippingStepper } from '../../warehouse/components/ShippingStepper'
import { warehouseService } from '../../warehouse/services/warehouseService'
import {
  getShippingExceptionKind,
  getShippingStepIndex,
  isDeliveryAttemptedStatus,
  normalizeTrackingStatus,
} from '../../warehouse/utils/warehouseStepper'
import { paymentService } from '../../payment/services/paymentService'
import { userService } from '../services/userService'
import type { ProofOfDeliveryDTO, TrackingResponseDTO } from '../../../types/warehouse'

function getApiErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined
    return data?.message || data?.error || err.message || 'Something went wrong'
  }
  return err instanceof Error ? err.message : 'Something went wrong'
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function DashboardShipping() {
  const navigate = useNavigate()

  const [bootstrapLoading, setBootstrapLoading] = useState(true)
  const [msisdns, setMsisdns] = useState<string[]>([])
  const [selectedMsisdn, setSelectedMsisdn] = useState<string | null>(null)

  const [trackingLoading, setTrackingLoading] = useState(false)
  const [tracking, setTracking] = useState<TrackingResponseDTO | null>(null)
  const [trackingError, setTrackingError] = useState<string | null>(null)

  const [podLoading, setPodLoading] = useState(false)
  const [pod, setPod] = useState<ProofOfDeliveryDTO | null>(null)
  const [podError, setPodError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setBootstrapLoading(true)
      try {
        await userService.getCurrentUser()
        const { subscriptions } = await paymentService.getAllSubscriptions()
        if (cancelled) return
        const active = subscriptions.filter((s) => s.isActive && s.status === 'active')
        const unique = Array.from(new Set(active.map((s) => s.msisdn.replace(/\D/g, ''))))
        setMsisdns(unique)
        if (unique.length === 1) setSelectedMsisdn(unique[0])
      } catch (e) {
        if (!cancelled) console.error('[Shipping]', e)
      } finally {
        if (!cancelled) setBootstrapLoading(false)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedMsisdn) {
      setTracking(null)
      setTrackingError(null)
      return
    }
    let cancelled = false
    const load = async () => {
      setTrackingLoading(true)
      setTrackingError(null)
      setPod(null)
      setPodError(null)
      try {
        const data = await warehouseService.getTrackingEventsByMsisdn(selectedMsisdn)
        if (!cancelled) setTracking(data)
      } catch (e) {
        if (!cancelled) {
          setTracking(null)
          setTrackingError(getApiErrorMessage(e))
        }
      } finally {
        if (!cancelled) setTrackingLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [selectedMsisdn])

  useEffect(() => {
    if (!tracking?.orderId || normalizeTrackingStatus(tracking.currentStatus) !== 'DELIVERED') {
      setPod(null)
      setPodError(null)
      return
    }
    let cancelled = false
    setPodLoading(true)
    setPodError(null)
    warehouseService
      .getProofOfDelivery(tracking.orderId)
      .then((p) => {
        if (!cancelled) setPod(p)
      })
      .catch((e) => {
        if (!cancelled) {
          setPod(null)
          setPodError(getApiErrorMessage(e))
        }
      })
      .finally(() => {
        if (!cancelled) setPodLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tracking?.orderId, tracking?.currentStatus])

  const orderedEvents = useMemo(() => {
    if (!tracking?.events?.length) return []
    return [...tracking.events].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }, [tracking])

  const stepIdx = tracking ? (getShippingStepIndex(tracking.currentStatus) ?? 0) : 0
  const delivered = !!(tracking && normalizeTrackingStatus(tracking.currentStatus) === 'DELIVERED')
  const exceptionKind = tracking ? getShippingExceptionKind(tracking.currentStatus) : null
  const attemptWarn = !!(tracking && isDeliveryAttemptedStatus(tracking.currentStatus))

  const exceptionCopy =
    exceptionKind === 'cancelled'
      ? 'This shipment was cancelled.'
      : exceptionKind === 'returned'
        ? 'The package was returned to sender.'
        : exceptionKind === 'issue'
          ? 'There is an issue or hold with this shipment — see the timeline below.'
          : null

  const showSelectors = msisdns.length > 1

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <DashboardNavbar />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-10">
          <h1 className="text-center font-grotesque text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
            SIM delivery
          </h1>
        </div>

        {bootstrapLoading ? (
          <div className="space-y-6">
            <div className="mx-auto h-52 max-w-6xl animate-pulse rounded-[28px] bg-white/5 ring-1 ring-white/10" />
            <div className="mx-auto h-32 max-w-6xl animate-pulse rounded-[28px] bg-white/5 ring-1 ring-white/10" />
          </div>
        ) : (
          <>
            <div className="mx-auto mb-8 flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/10 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </button>

              {showSelectors && selectedMsisdn !== null && (
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor="ship-msisdn" className="text-sm text-neutral-400">
                    Number:
                  </label>
                  <select
                    id="ship-msisdn"
                    value={selectedMsisdn}
                    onChange={(e) => setSelectedMsisdn(e.target.value)}
                    className="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                  >
                    {msisdns.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {msisdns.length === 0 && (
              <div className="mx-auto max-w-4xl rounded-[28px] bg-white/5 p-10 ring-1 ring-white/10 sm:p-12">
                <div className="mx-auto mb-4 flex justify-center">
                  <Package className="h-10 w-10 text-neutral-500" aria-hidden />
                </div>
                <h2 className="mb-3 text-center font-grotesque text-2xl font-semibold text-white sm:text-3xl">
                  No SIM number to track yet
                </h2>
                <p className="text-center text-sm text-neutral-400 sm:text-base">
                  Tracking appears when you have an active line. Physical SIM shipment only applies when you selected{' '}
                  <span className="text-neutral-200">&quot;I need a SIM&quot;</span> during setup — then we can ship your
                  card and show progress here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/packages')}
                  className="mx-auto mt-8 flex h-12 min-w-[200px] items-center justify-center rounded-2xl bg-[#ABFF63] px-8 text-sm font-semibold text-neutral-900 transition hover:brightness-95"
                >
                  Add a SIM or plan
                </button>
              </div>
            )}

            {msisdns.length > 1 && selectedMsisdn === null && (
              <div className="mx-auto max-w-4xl rounded-[28px] bg-white/5 p-10 ring-1 ring-white/10 sm:p-12">
                <p className="mb-6 text-center text-neutral-400">
                  Choose which line&apos;s delivery to track.
                </p>
                <select
                  className="mx-auto mb-8 block max-w-xs rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
                  defaultValue=""
                  onChange={(e) => setSelectedMsisdn(e.target.value)}
                >
                  <option value="" disabled>
                    Select number
                  </option>
                  {msisdns.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedMsisdn !== null && (
              <>
                {trackingLoading && (
                  <div className="mx-auto max-w-6xl space-y-4">
                    <div className="h-40 animate-pulse rounded-[28px] bg-white/5 ring-1 ring-white/10" />
                    <div className="h-28 animate-pulse rounded-[28px] bg-white/5 ring-1 ring-white/10" />
                  </div>
                )}

                {trackingError && !trackingLoading && (
                  <div className="mx-auto mb-6 max-w-6xl rounded-lg border border-amber-500/40 bg-amber-500/10 p-6">
                    <div className="flex items-start">
                      <AlertCircle className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                      <div>
                        <h3 className="mb-1 font-semibold text-white">No shipment to show right now</h3>
                        <p className="text-sm text-neutral-400">{trackingError}</p>
                        <p className="mt-3 text-xs text-neutral-500">
                          If you use an eSIM or haven&apos;t ordered a physical SIM, delivery tracking won&apos;t apply.
                          If you chose <span className="text-neutral-300">&quot;I need a SIM&quot;</span> and finished
                          payment, try again later — MVNX sync can lag a few minutes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {tracking && !trackingLoading && (
                  <>
                    {exceptionCopy && (
                      <div className="mx-auto mb-6 max-w-6xl rounded-lg border border-amber-500/40 bg-amber-500/10 p-6">
                        <div className="flex items-start">
                          <AlertCircle className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                          <p className="text-sm text-neutral-200">{exceptionCopy}</p>
                        </div>
                      </div>
                    )}

                    <div className="mx-auto mb-10 max-w-6xl rounded-[28px] bg-transparent p-6 ring-1 ring-white/10 sm:p-8">
                      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs text-neutral-500">Order</p>
                          <p className="font-mono text-lg text-white">{tracking.orderId}</p>
                        </div>
                        {tracking.trackingNumber && (
                          <div>
                            <p className="text-xs text-neutral-500">Tracking number</p>
                            <p className="text-sm text-white">{tracking.trackingNumber}</p>
                          </div>
                        )}
                        {tracking.estimatedDeliveryDate && (
                          <div>
                            <p className="text-xs text-neutral-500">Est. delivery</p>
                            <p className="text-sm text-white">{formatWhen(tracking.estimatedDeliveryDate)}</p>
                          </div>
                        )}
                      </div>

                      {getShippingStepIndex(tracking.currentStatus) === null && (
                        <p className="mb-4 text-sm text-neutral-400">
                          Status: <span className="text-white">{tracking.currentStatus}</span>
                        </p>
                      )}

                      <ShippingStepper
                        activeIndex={stepIdx}
                        deliveryAttemptWarning={attemptWarn}
                        fullyComplete={delivered}
                      />
                    </div>

                    {delivered && (
                      <div className="mx-auto mb-10 max-w-6xl rounded-[28px] bg-transparent p-6 ring-1 ring-white/10 sm:p-8">
                        <h2 className="mb-6 font-grotesque text-xl font-semibold text-white sm:text-2xl">
                          Proof of delivery
                        </h2>
                        {podLoading && (
                          <div className="flex items-center gap-2 text-neutral-400">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading proof of delivery…
                          </div>
                        )}
                        {podError && !podLoading && (
                          <div className="rounded-lg border border-neutral-700 bg-neutral-800/80 p-4 text-sm text-neutral-300">
                            {podError}
                            <p className="mt-2 text-xs text-neutral-500">
                              Proof of delivery can take up to 24 hours after the package arrives.
                            </p>
                          </div>
                        )}
                        {pod && !podLoading && (
                          <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <p className="mb-1 text-xs text-neutral-500">Delivered</p>
                                <p className="text-white">{formatWhen(pod.deliveryDate)}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs text-neutral-500">Recipient</p>
                                <p className="text-white">{pod.recipientName}</p>
                              </div>
                              {pod.driverName && (
                                <div>
                                  <p className="mb-1 text-xs text-neutral-500">Driver</p>
                                  <p className="text-white">{pod.driverName}</p>
                                  {pod.driverContactNumber && (
                                    <p className="text-sm text-neutral-400">{pod.driverContactNumber}</p>
                                  )}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="rounded-full bg-lime-400/10 px-3 py-1 text-xs text-lime-300">
                                  ID verified: {pod.idVerified ? 'Yes' : 'No'}
                                </span>
                              </div>
                              {pod.notes && <p className="text-sm text-neutral-400">{pod.notes}</p>}
                              {pod.idNumber && (
                                <p className="font-mono text-xs text-neutral-500">ID •••• {pod.idNumber.slice(-4)}</p>
                              )}
                            </div>
                            <div className="space-y-4">
                              {pod.recipientSignature?.startsWith('data:image') && (
                                <div>
                                  <p className="mb-2 text-xs text-neutral-500">Signature</p>
                                  <img
                                    src={pod.recipientSignature}
                                    alt=""
                                    className="max-h-36 max-w-full rounded-lg border border-white/10 bg-white"
                                  />
                                </div>
                              )}
                              {pod.deliveryPhoto && (
                                <div>
                                  <p className="mb-2 text-xs text-neutral-500">Delivery photo</p>
                                  <img
                                    src={pod.deliveryPhoto}
                                    alt=""
                                    className="max-h-56 max-w-full rounded-lg border border-white/10 object-cover"
                                  />
                                </div>
                              )}
                              {pod.deliveryLocation && (
                                <div>
                                  <p className="mb-1 text-xs text-neutral-500">Location</p>
                                  <p className="text-sm text-neutral-200">{pod.deliveryLocation.address}</p>
                                  <a
                                    href={`https://www.google.com/maps?q=${pod.deliveryLocation.latitude},${pod.deliveryLocation.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-sm text-[#ABFF63] hover:underline"
                                  >
                                    Open in Maps
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mx-auto max-w-6xl rounded-[28px] bg-transparent p-6 ring-1 ring-white/10 sm:p-8">
                      <h2 className="mb-6 font-grotesque text-xl font-semibold text-white sm:text-2xl">
                        Updates
                      </h2>
                      <ul className="space-y-4">
                        {orderedEvents.map((ev) => (
                          <li
                            key={ev.eventId}
                            className="border-b border-neutral-800 pb-4 last:border-0 last:pb-0"
                          >
                            <p className="text-xs text-neutral-500">{formatWhen(ev.timestamp)}</p>
                            <p className="mt-1 text-sm font-medium text-white">{ev.description}</p>
                            <p className="mt-0.5 text-xs text-neutral-500">{ev.location}</p>
                            {ev.trackingUrl && (
                              <a
                                href={ev.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs text-[#ABFF63] hover:underline"
                              >
                                Courier tracking
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
