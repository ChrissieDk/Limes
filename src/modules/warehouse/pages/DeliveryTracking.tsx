import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardNavbar from '../../auth/components/DashboardNavbar'
import Footer from '../../auth/components/Footer'
import { userService } from '../../auth/services/userService'
import { warehouseService } from '../services/warehouseService'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import { formatDate } from '../../../utils/dateFormat'
import type { TrackingResponseDTO, TrackingEventDTO, ProofOfDeliveryDTO } from '../../../types/warehouse'
import type { MsisdnData } from '../../../types/user'
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronDown,
  RefreshCw,
  X,
  Signature,
  Camera,
  User,
  Phone,
  Calendar,
} from 'lucide-react'

interface SimOption {
  msisdn: string
  name: string
  tracking: TrackingResponseDTO | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ORDER_CREATED: {
    label: 'Order Created',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    icon: <Package className="w-4 h-4" />,
  },
  WAREHOUSE_PROCESSING: {
    label: 'Processing',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    icon: <Clock className="w-4 h-4" />,
  },
  PICKED_UP: {
    label: 'Picked Up',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    icon: <Truck className="w-4 h-4" />,
  },
  IN_TRANSIT: {
    label: 'In Transit',
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10',
    icon: <Truck className="w-4 h-4" />,
  },
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    icon: <MapPin className="w-4 h-4" />,
  },
  DELIVERY_ATTEMPTED: {
    label: 'Delivery Attempted',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  RETURNED_TO_SENDER: {
    label: 'Returned',
    color: 'text-neutral-400',
    bg: 'bg-neutral-400/10',
    icon: <Truck className="w-4 h-4" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    icon: <X className="w-4 h-4" />,
  },
  ON_HOLD: {
    label: 'On Hold',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    icon: <Clock className="w-4 h-4" />,
  },
  EXCEPTION: {
    label: 'Exception',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  PAYMENT_RECEIVED: {
    label: 'Payment Received',
    color: 'text-lime-400',
    bg: 'bg-lime-400/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
}

function getEventConfig(status: string) {
  return (
    STATUS_CONFIG[status] || {
      label: status,
      color: 'text-neutral-400',
      bg: 'bg-neutral-400/10',
      icon: <Package className="w-4 h-4" />,
    }
  )
}

function EventTypeBadge({ type }: { type: TrackingEventDTO['eventType'] }) {
  const styles = {
    INFO: 'bg-blue-400/10 text-blue-400',
    SUCCESS: 'bg-lime-400/10 text-lime-400',
    WARNING: 'bg-yellow-400/10 text-yellow-400',
    ERROR: 'bg-red-400/10 text-red-400',
  }
  return (
    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${styles[type]}`}>
      {type}
    </span>
  )
}

function TimelineEvent({ event, isLast }: { event: TrackingEventDTO; isLast: boolean }) {
  const config = getEventConfig(event.status)

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      {!isLast && <div className="absolute left-[19px] top-8 bottom-0 w-px bg-neutral-700" />}

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center ${config.color}`}>
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-grotesque font-semibold text-white text-sm">{config.label}</span>
              <EventTypeBadge type={event.eventType} />
            </div>
            <p className="font-manrope text-neutral-400 text-sm">{event.description}</p>
          </div>
          <span className="font-manrope text-neutral-500 text-xs whitespace-nowrap flex-shrink-0">
            {formatDate(event.timestamp)}
          </span>
        </div>

        {event.location && event.location !== 'Online' && (
          <div className="font-manrope flex items-center gap-1.5 mt-2 text-neutral-500 text-xs">
            <MapPin className="w-3 h-3" />
            <span>{event.location}</span>
            {event.locationCode && event.locationCode !== 'WEB' && (
              <span className="text-neutral-600">({event.locationCode})</span>
            )}
          </div>
        )}

        {event.courierName && (
          <div className="font-manrope flex items-center gap-1.5 mt-1.5 text-neutral-500 text-xs">
            <Truck className="w-3 h-3" />
            <span>{event.courierName}</span>
            {event.trackingUrl && (
              <a
                href={event.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ABFF63] hover:underline"
              >
                Track →
              </a>
            )}
          </div>
        )}

        {event.estimatedDeliveryWindow && (
          <div className="font-manrope flex items-center gap-1.5 mt-1.5 text-neutral-500 text-xs">
            <Clock className="w-3 h-3" />
            <span>Estimated: {event.estimatedDeliveryWindow}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function PodModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const [pod, setPod] = useState<ProofOfDeliveryDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPod = async () => {
      try {
        const data = await warehouseService.getProofOfDelivery(orderId)
        setPod(data)
      } catch (err) {
        setError(getAxiosErrorMessage(err, 'Failed to load proof of delivery'))
      } finally {
        setLoading(false)
      }
    }
    fetchPod()
  }, [orderId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-800 rounded-2xl border border-neutral-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-5 py-4 flex items-center justify-between">
          <h3 className="font-grotesque text-white font-semibold text-lg">Proof of Delivery</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-[#ABFF63] animate-spin" />
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {pod && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700/50">
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Calendar className="w-3 h-3" />
                    <span>Delivered</span>
                  </div>
                  <p className="font-manrope text-white text-sm font-medium">{formatDate(pod.deliveryDate)}</p>
                </div>
                <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700/50">
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <User className="w-3 h-3" />
                    <span>Recipient</span>
                  </div>
                  <p className="font-manrope text-white text-sm font-medium">{pod.recipientName}</p>
                </div>
              </div>

              {pod.deliveryLocation && (
                <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700/50">
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>Delivery Location</span>
                  </div>
                  <p className="font-manrope text-white text-sm">{pod.deliveryLocation.address}</p>
                  <p className="font-manrope text-neutral-500 text-xs mt-1">
                    {pod.deliveryLocation.latitude.toFixed(5)}, {pod.deliveryLocation.longitude.toFixed(5)}
                  </p>
                </div>
              )}

              {pod.driverName && (
                <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700/50">
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-1">
                    <Truck className="w-3 h-3" />
                    <span>Driver</span>
                  </div>
                  <p className="font-manrope text-white text-sm">{pod.driverName}</p>
                  {pod.driverContactNumber && (
                    <p className="font-manrope text-neutral-500 text-xs mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {pod.driverContactNumber}
                    </p>
                  )}
                </div>
              )}

              {pod.idVerified && (
                <div className="font-manrope flex items-center gap-2 text-lime-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ID verified on delivery</span>
                  {pod.idNumber && <span className="font-manrope text-neutral-500 text-xs">(••••{pod.idNumber.slice(-4)})</span>}
                </div>
              )}

              {pod.notes && (
                <div className="bg-neutral-900/50 rounded-xl p-3 border border-neutral-700/50">
                  <p className="font-manrope text-neutral-400 text-xs mb-1">Notes</p>
                  <p className="font-manrope text-white text-sm">{pod.notes}</p>
                </div>
              )}

              {pod.recipientSignature && (
                <div>
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-2">
                    <Signature className="w-3 h-3" />
                    <span>Signature</span>
                  </div>
                  <img
                    src={pod.recipientSignature}
                    alt="Recipient signature"
                    className="w-full max-h-32 object-contain bg-white rounded-lg"
                  />
                </div>
              )}

              {pod.deliveryPhoto && (
                <div>
                  <div className="font-manrope flex items-center gap-2 text-neutral-500 text-xs mb-2">
                    <Camera className="w-3 h-3" />
                    <span>Delivery Photo</span>
                  </div>
                  <img
                    src={pod.deliveryPhoto}
                    alt="Delivery photo"
                    className="w-full rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function isAxiosErrorWithStatus(err: unknown, status: number): boolean {
  const e = err as { response?: { status?: number } } | undefined
  return e?.response?.status === status
}

function isNoTrackingError(err: unknown): boolean {
  return isAxiosErrorWithStatus(err, 403) || isAxiosErrorWithStatus(err, 404)
}

function friendlyWarehouseError(err: unknown): string {
  const msg = getAxiosErrorMessage(err, '').toLowerCase()
  if (msg.includes('circuit')) {
    return 'Our delivery tracking service is temporarily unavailable. Please try again in a few minutes.'
  }
  if (msg.includes('unauthorized') || msg.includes('401')) {
    return 'Your session has expired. Please sign in again to view delivery tracking.'
  }
  if (msg.includes('forbidden') || msg.includes('403')) {
    return "We couldn't verify your account. Please contact support if this continues."
  }
  if (msg.includes('network') || !msg) {
    return "We couldn't connect to our delivery tracking service. Please check your internet connection and try again."
  }
  if (msg.includes('500') || msg.includes('internal')) {
    return "We're experiencing a technical issue with delivery tracking. Please try again shortly."
  }
  return 'Something went wrong while loading delivery tracking. Please try again.'
}

function createSyntheticPendingTracking(msisdn: string): TrackingResponseDTO {
  return {
    orderId: 'PENDING',
    trackingNumber: '',
    msisdn,
    currentStatus: 'PAYMENT_RECEIVED',
    estimatedDeliveryDate: undefined,
    events: [
      {
        eventId: `pending-${msisdn}`,
        timestamp: new Date().toISOString(),
        status: 'PAYMENT_RECEIVED',
        description: 'Your payment has been received. Your order will be processed shortly.',
        location: 'Online',
        locationCode: 'WEB',
        eventType: 'INFO',
      },
    ],
  }
}

export default function DeliveryTracking() {
  const navigate = useNavigate()
  const [sims, setSims] = useState<SimOption[]>([])
  const [selectedMsisdn, setSelectedMsisdn] = useState<string>('')
  const [tracking, setTracking] = useState<TrackingResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPodForOrderId, setShowPodForOrderId] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)



  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])



  const DELIVERY_PRODUCT_ID = '7023225P'

  const loadSimsWithTracking = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const user = await userService.getCurrentUser()
      const allMsisdns: MsisdnData[] = user.msisdns || []

      // Only show SIMs that were ordered for physical delivery.
      // productId '7023225P' is the physical SIM delivery package.
      const deliveryMsisdns = allMsisdns.filter((m) => m.productId === DELIVERY_PRODUCT_ID)

      // Fetch tracking for delivery SIMs in parallel.
      const results = await Promise.all(
        deliveryMsisdns.map(async (msisdnData) => {
          try {
            const data = await warehouseService.getTrackingEventsByMsisdn(msisdnData.msisdn)
            return { msisdn: msisdnData.msisdn, tracking: data as TrackingResponseDTO | null, err: null }
          } catch (e) {
            return { msisdn: msisdnData.msisdn, tracking: null, err: e }
          }
        })
      )

      // Transform errors into synthetic tracking for new orders (403/404 = not yet in warehouse)
      const processed = results.map((r) => {
        if (r.tracking) return r
        if (r.err && isNoTrackingError(r.err)) {
          return { msisdn: r.msisdn, tracking: createSyntheticPendingTracking(r.msisdn), err: null }
        }
        return r
      })

      // Check for real systemic errors (401, 500, network) — only if NO SIMs have any tracking
      const failures = processed.filter((r) => r.err !== null)
      const hasAnyTracking = processed.some((r) => r.tracking !== null)
      if (failures.length === processed.length && processed.length > 0 && !hasAnyTracking) {
        setError(friendlyWarehouseError(failures[0].err))
        setLoading(false)
        return
      }

      const shippedSims: SimOption[] = processed
        .filter((r) => {
          if (!r.tracking) return false
          const events = r.tracking.events
          if (events.length === 0) return false
          return true
        })
        .map((r) => ({
          msisdn: r.msisdn,
          name: allMsisdns.find((m) => m.msisdn === r.msisdn)?.simDescription || r.msisdn,
          tracking: r.tracking,
        }))

      setSims(shippedSims)
      if (shippedSims.length > 0) {
        setSelectedMsisdn(shippedSims[0].msisdn)
        setTracking(shippedSims[0].tracking)
      }
    } catch (err) {
      setError(getAxiosErrorMessage(err, 'Failed to load your account details'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSimsWithTracking()
  }, [loadSimsWithTracking])

  const handleSelectSim = async (msisdn: string) => {
    setSelectedMsisdn(msisdn)
    setDropdownOpen(false)
    setError(null)
    // Refresh tracking data for the selected SIM
    try {
      const data = await warehouseService.getTrackingEventsByMsisdn(msisdn)
      setTracking(data)
      // Update the sims array with fresh data
      setSims((prev) =>
        prev.map((sim) => (sim.msisdn === msisdn ? { ...sim, tracking: data } : sim))
      )
    } catch (e) {
      if (isNoTrackingError(e)) {
        const pending = createSyntheticPendingTracking(msisdn)
        setTracking(pending)
        setSims((prev) =>
          prev.map((sim) => (sim.msisdn === msisdn ? { ...sim, tracking: pending } : sim))
        )
      } else {
        setError(friendlyWarehouseError(e))
      }
    }
  }

  const isDelivered = tracking?.currentStatus === 'DELIVERED'

  return (
    <div className="min-h-screen bg-neutral-900">
      <DashboardNavbar />

      {showPodForOrderId && (
        <PodModal orderId={showPodForOrderId} onClose={() => setShowPodForOrderId(null)} />
      )}

      <main className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white font-grotesque font-extrabold text-3xl sm:text-4xl">
              Delivery Tracking
            </h1>
            <p className="font-manrope text-neutral-400 mt-2">Track your SIM card deliveries in real-time.</p>
          </div>
          <button
            onClick={() => loadSimsWithTracking()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm font-semibold px-4 py-2.5 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#ABFF63] animate-spin" />
          </div>
        ) : error && sims.length === 0 ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : sims.length === 0 ? (
          <div className="rounded-2xl bg-neutral-800 border border-neutral-700 p-8 text-center">
            <Truck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="font-grotesque text-white font-semibold text-lg">No SIMs for delivery</h3>
            <p className="font-manrope text-neutral-400 text-sm mt-2">
              You don&apos;t have any SIMs ordered for delivery. SIMs activated with an existing ICCID don&apos;t have delivery tracking.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#ABFF63] text-neutral-900 font-bold px-5 py-2.5 hover:brightness-95 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* SIM Selector Dropdown */}
            {sims.length >= 1 && (
              <div className="mb-6 relative" ref={dropdownRef}>
                <label className="font-manrope text-neutral-400 text-sm font-medium mb-2 block">
                  {sims.length === 1 ? 'SIM' : 'Select SIM'}
                </label>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="relative w-full sm:w-auto min-w-[280px] flex items-center justify-between gap-4 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-left hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center justify-center size-8 rounded-lg bg-[#ABFF63]/10 text-[#ABFF63] text-xs font-bold">
                      SIM
                    </span>
                    <div className="min-w-0">
                      <p className="font-manrope text-white text-sm font-medium truncate">
                        {sims.find((s) => s.msisdn === selectedMsisdn)?.name || selectedMsisdn}
                      </p>
                      <p className="text-neutral-500 text-xs font-mono">{selectedMsisdn}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full sm:w-auto min-w-[280px] rounded-xl bg-neutral-800 border border-neutral-700 shadow-xl overflow-hidden">
                    {sims.map((sim) => (
                      <button
                        key={sim.msisdn}
                        onClick={() => handleSelectSim(sim.msisdn)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          selectedMsisdn === sim.msisdn
                            ? 'bg-[#ABFF63]/10'
                            : 'hover:bg-neutral-700/50'
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center size-8 rounded-lg text-xs font-bold ${
                            selectedMsisdn === sim.msisdn
                              ? 'bg-[#ABFF63] text-neutral-900'
                              : 'bg-neutral-700 text-neutral-400'
                          }`}
                        >
                          {sim.msisdn === selectedMsisdn ? '✓' : 'SIM'}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              selectedMsisdn === sim.msisdn ? 'text-[#ABFF63]' : 'text-white'
                            }`}
                          >
                            {sim.name}
                          </p>
                          <p className="text-neutral-500 text-xs font-mono">{sim.msisdn}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tracking Card */}
            <div className="rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden">
              {!tracking ? (
                <div className="p-8 text-center">
                  <Truck className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                  <h3 className="font-grotesque text-white font-semibold text-lg">No tracking available</h3>
                  <p className="font-manrope text-neutral-400 text-sm mt-2">
                    There are no delivery records for this SIM yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="p-5 border-b border-neutral-700">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-manrope text-neutral-500 text-xs">Order</span>
                          <span className="text-white font-mono text-sm">#{tracking.orderId}</span>
                          {tracking.trackingNumber && (
                            <span className="font-manrope text-neutral-500 text-xs">
                              • {tracking.trackingNumber}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {(() => {
                            const config = getEventConfig(tracking.currentStatus)
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
                                {config.icon}
                                {config.label}
                              </span>
                            )
                          })()}
                          {tracking.estimatedDeliveryDate && !isDelivered && (
                            <span className="font-manrope text-neutral-500 text-xs">
                              Est. {formatDate(tracking.estimatedDeliveryDate)}
                            </span>
                          )}
                        </div>
                      </div>

                      {isDelivered && (
                        <button
                          onClick={() => setShowPodForOrderId(tracking.orderId)}
                          className="inline-flex items-center gap-2 rounded-xl bg-neutral-700 text-white text-xs font-semibold px-3 py-2 hover:bg-neutral-600 transition-colors flex-shrink-0"
                        >
                          <Signature className="w-3.5 h-3.5" />
                          View POD
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-5">
                    {tracking.currentStatus === 'PAYMENT_RECEIVED' && (
                      <div className="mb-5 rounded-xl bg-blue-400/10 border border-blue-400/20 p-4">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-manrope text-blue-400 text-sm font-medium">
                              Your order is being processed
                            </p>
                            <p className="font-manrope text-blue-400/70 text-xs mt-1">
                              Tracking details will appear here once your SIM is dispatched from our warehouse.
                              Click Refresh to check for updates.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {tracking.events.length === 0 ? (
                      <p className="font-manrope text-neutral-500 text-sm text-center py-8">
                        No tracking events available yet.
                      </p>
                    ) : (
                      <div>
                        {tracking.events.map((event, index) => (
                          <TimelineEvent
                            key={event.eventId}
                            event={event}
                            isLast={index === tracking.events.length - 1}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
