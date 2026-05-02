import { useState } from 'react'
import { getServiceDisplayValue, isServiceAvailable } from '../../payment/utils/dynamicPricing'
import type { ServiceType } from '../../payment/config/ratingTable'
import type { PackageType } from '../../payment/config/ratingTable'

export type PlanAllocation = {
  data: number
  airtime: number
  sms: number
  voice: number
  whatsapp: number
}

interface PlanBuilderProps {
  onContinue: (allocation: PlanAllocation) => void
  onBack: () => void
}

const LINE_ITEMS: Array<{
  key: keyof PlanAllocation
  serviceType: ServiceType
  label: string
  iconSrc: string
  bgClass: string
  step: number
}> = [
  { key: 'data', serviceType: 'DATA', label: 'Mobile data', iconSrc: 'data_icon.svg', bgClass: 'bg-[#FDDA36]', step: 5 },
  { key: 'airtime', serviceType: 'AIRTIME', label: 'Airtime', iconSrc: 'lime_icon_small.svg', bgClass: 'bg-[#CDA7FC]', step: 5 },
  { key: 'sms', serviceType: 'SMS', label: 'SMS', iconSrc: 'sms_icon_small.svg', bgClass: 'bg-[#5BA0FF]', step: 5 },
  { key: 'voice', serviceType: 'VOICE', label: 'Voice minutes', iconSrc: 'plan_phone.svg', bgClass: 'bg-pink-300', step: 5 },
  { key: 'whatsapp', serviceType: 'WHATSAPP', label: 'WhatsApp', iconSrc: 'whatsapp_icon_small.svg', bgClass: 'bg-[#ABFF63]', step: 5 },
]

export default function PlanBuilder({ onContinue, onBack }: PlanBuilderProps) {
  const packageType: PackageType = 'contract'

  const [allocation, setAllocation] = useState<PlanAllocation>({
    data: 30,
    airtime: 15,
    sms: 10,
    voice: 0,
    whatsapp: 0,
  })

  const clampRands = (value: number) => Math.max(0, Math.min(1000, Math.round(value)))

  const setRands = (key: keyof PlanAllocation, value: number) => {
    setAllocation((prev) => ({ ...prev, [key]: clampRands(value) }))
  }

  const adjustRands = (key: keyof PlanAllocation, delta: number) => {
    setRands(key, allocation[key] + delta)
  }

  const parseRandsInput = (raw: string): number => {
    const onlyDigits = raw.replace(/[^\d]/g, '')
    return onlyDigits.length === 0 ? 0 : Number.parseInt(onlyDigits, 10)
  }

  const getDisplay = (serviceType: ServiceType, rands: number): string => {
    if (!isServiceAvailable(serviceType, packageType)) return 'Not available yet'
    const display = getServiceDisplayValue(serviceType, rands, packageType)
    if (!display) return 'Not available yet'
    if (serviceType === 'AIRTIME') return display.replace(/\s*airtime$/i, '')
    return display
  }

  const totalRands = LINE_ITEMS.reduce(
    (sum, item) => sum + (isServiceAvailable(item.serviceType, packageType) ? allocation[item.key] : 0),
    0
  )

  const activeSummaryItems = LINE_ITEMS.filter(
    (item) =>
      allocation[item.key] > 0 &&
      isServiceAvailable(item.serviceType, packageType)
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
        {LINE_ITEMS.map((item) => {
          const isWide = item.key === 'data'
          const enabled = isServiceAvailable(item.serviceType, packageType)
          const rands = allocation[item.key]
          const display = getDisplay(item.serviceType, rands)

          return (
            <div
              key={item.key}
              className={`rounded-[26px] ${item.bgClass} shadow-[0_24px_70px_rgba(0,0,0,0.35)] flex flex-col justify-center gap-4 ${
                isWide ? 'sm:col-span-2 p-7 py-8' : 'p-5'
              }`}
            >
              <div
                className={`flex flex-col ${
                  isWide ? 'gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6' : 'gap-4'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={`${import.meta.env.BASE_URL}images/${item.iconSrc}`}
                    alt={item.label}
                    className="h-10 w-10"
                  />
                  <div className="min-w-0">
                    <div className="font-grotesque font-bold text-neutral-900 text-[28px] md:text-[32px] leading-[0.95] tracking-tight">
                      {item.label}
                    </div>
                    <div className="mt-0.5 text-neutral-900/70 text-sm font-manrope">
                      <span>You&apos;ll get: </span>
                      <span className="font-extrabold text-neutral-900">{display}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${enabled ? '' : 'opacity-70'} ${isWide ? 'sm:w-[340px]' : ''}`}>
                  <button
                    type="button"
                    aria-label={`Decrease ${item.label}`}
                    disabled={!enabled}
                    onClick={() => adjustRands(item.key, -item.step)}
                    className="size-11 grid place-items-center rounded-2xl bg-black/10 text-neutral-900 text-3xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <div className="flex-1 rounded-2xl bg-white/35 px-4 py-0.5 flex items-center justify-center gap-1">
                    <span className="font-grotesque font-bold text-neutral-900 text-4xl tracking-tight leading-[0.9]">R</span>
                    <label className="sr-only" htmlFor={`plan-${item.key}`}>
                      {item.label} amount in rands
                    </label>
                    <input
                      id={`plan-${item.key}`}
                      type="text"
                      inputMode="numeric"
                      value={String(rands)}
                      onChange={(e) => setRands(item.key, parseRandsInput(e.target.value))}
                      disabled={!enabled}
                      className="min-w-[1ch] text-left font-grotesque font-bold text-neutral-900 text-4xl tracking-tight leading-[0.9] bg-transparent border-0 outline-none p-0 disabled:opacity-60"
                      style={{ appearance: 'none', width: `${Math.max(1, String(rands).length)}ch` }}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Increase ${item.label}`}
                    disabled={!enabled}
                    onClick={() => adjustRands(item.key, item.step)}
                    className="size-11 grid place-items-center rounded-2xl bg-black/10 text-neutral-900 text-3xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-[26px] bg-[#26252C] border border-white/10 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="font-grotesque font-bold text-white text-[28px] sm:text-[32px] leading-tight">Your plan total</div>
            <div className="mt-1 text-white/60 text-sm font-manrope">Review your selections and continue.</div>
          </div>
          <div className="text-right">
            <div className="font-manrope text-white/50 text-xs font-semibold uppercase tracking-wide">Total</div>
            <div className="mt-1 font-grotesque font-bold text-white text-4xl tracking-tight">R{totalRands}</div>
          </div>
        </div>

        <div
          className="mt-6 grid grid-cols-1 gap-3 sm:[grid-template-columns:repeat(var(--summary-count),minmax(0,1fr))]"
          style={{ ['--summary-count' as string]: activeSummaryItems.length || 1 } as React.CSSProperties}
        >
          {activeSummaryItems.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl bg-white/6 border border-white/10 p-4"
            >
              <div className="font-manrope text-white/70 text-xs font-semibold">{item.label}</div>
              <div className="mt-1 flex flex-col gap-0.5">
                <div className="text-white font-bold">{getDisplay(item.serviceType, allocation[item.key])}</div>
                <div className="font-manrope text-white/70 text-sm">R{allocation[item.key]}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6">
        <button
          onClick={() => onContinue(allocation)}
          disabled={totalRands === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-6 py-3 hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue to payment</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        </div>
      </div>
    </div>
  )
}
