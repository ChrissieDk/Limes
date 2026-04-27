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

export const inventoryService = {
  /** Returns true when the SIM exists in inventory and its status is RESERVED (already activated). */
  async simIsReserved(iccid: string): Promise<boolean> {
    const trimmed = iccid.trim()
    if (!trimmed) return false

    try {
      const { data } = await apiClient.get<unknown>(`/resources/inventory/sim/${trimmed}`)
      if (isSimInventoryRecord(data)) {
        return data.status === 'RESERVED'
      }
      return false
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        // Not in inventory at all — allow through
        return false
      }
      console.error('[inventory] SIM lookup failed:', err)
      return false
    }
  },
}
