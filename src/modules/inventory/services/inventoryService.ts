import axios from 'axios'
import { apiClient } from '../../../config/api'

interface SimInventoryRecord {
  simType: string
  iccid: string
  imsi: string
  status: string
  isAvailable: boolean
  [key: string]: unknown
}

function isSimInventoryRecord(data: unknown): data is SimInventoryRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as Record<string, unknown>).status === 'string'
  )
}

export type SimCheckOutcome =
  | { ok: true; status: 'AVAILABLE'; record: SimInventoryRecord }
  | { ok: false; status: 'RESERVED'; message: string }
  | { ok: false; status: 'NOT_FOUND'; message: string }
  | { ok: false; status: 'INVALID_RESPONSE'; message: string }
  | { ok: false; status: 'NETWORK_ERROR'; message: string }
  | { ok: false; status: 'SERVER_ERROR'; message: string }
  | { ok: false; status: 'UNKNOWN_ERROR'; message: string }

const MESSAGES = {
  RESERVED:
    'This SIM has already been activated and is linked to another account. If you believe this is a mistake, please contact our support team.',
  NOT_FOUND:
    "We couldn't find this ICCID in our system. Please double-check the 19–20 digit number printed on the back of your SIM card and try again.",
  INVALID_RESPONSE:
    'We received an unexpected response while checking your SIM. Please try again or contact support if this keeps happening.',
  NETWORK_ERROR:
    "We couldn't reach our SIM verification service. Please check your internet connection and try again.",
  SERVER_ERROR:
    "We're experiencing a technical issue while verifying your SIM. Please wait a moment and try again.",
  UNKNOWN_ERROR:
    'Something went wrong while checking your SIM. Please try again.',
}

export const inventoryService = {
  /**
   * Check whether a SIM ICCID is valid and available for activation.
   *
   * Returns a discriminated result so callers can give precise user feedback
   * instead of silently swallowing errors.
   */
  async checkSim(iccid: string): Promise<SimCheckOutcome> {
    const trimmed = iccid.trim()
    if (!trimmed) {
      return { ok: false, status: 'NOT_FOUND', message: MESSAGES.NOT_FOUND }
    }

    try {
      const { data } = await apiClient.get<unknown>(`/resources/inventory/sim/${trimmed}`)

      if (!isSimInventoryRecord(data)) {
        return { ok: false, status: 'INVALID_RESPONSE', message: MESSAGES.INVALID_RESPONSE }
      }

      if (data.status === 'RESERVED') {
        return { ok: false, status: 'RESERVED', message: MESSAGES.RESERVED }
      }

      if (data.status === 'AVAILABLE' || data.isAvailable === true) {
        return { ok: true, status: 'AVAILABLE', record: data }
      }

      // Any other status (SUSPENDED, EXPIRED, etc.) — treat as unavailable
      return {
        ok: false,
        status: 'RESERVED',
        message: MESSAGES.RESERVED,
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          return { ok: false, status: 'NOT_FOUND', message: MESSAGES.NOT_FOUND }
        }
        if (!err.response) {
          // Network error (no response received)
          return { ok: false, status: 'NETWORK_ERROR', message: MESSAGES.NETWORK_ERROR }
        }
        if (err.response.status >= 500) {
          return { ok: false, status: 'SERVER_ERROR', message: MESSAGES.SERVER_ERROR }
        }
      }

      return { ok: false, status: 'UNKNOWN_ERROR', message: MESSAGES.UNKNOWN_ERROR }
    }
  },

  /** @deprecated Use checkSim() for proper error handling. */
  async simIsReserved(iccid: string): Promise<boolean> {
    const result = await this.checkSim(iccid)
    return result.ok === false && result.status === 'RESERVED'
  },
}
