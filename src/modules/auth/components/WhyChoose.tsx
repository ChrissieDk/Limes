import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getServiceDisplayValue, isServiceAvailable } from '../../payment/utils/dynamicPricing'
import type { ServiceType } from '../../payment/utils/dynamicPricing'
import type { PackageType } from '../../payment/config/ratingTable'

export default function WhyChoose() {
  const packageType: PackageType = 'prepaid'
  const planTilesHeightLgPx = 528

  const serviceEnabled: Readonly<Record<ServiceType, boolean>> = {
    DATA: true,
    AIRTIME: true,
    SMS: true,
    WHATSAPP: true,
    VOICE: true,
    MMS: false,
  }

  type AllocationKey = 'data' | 'airtime' | 'sms' | 'voice' | 'whatsapp'
  type Allocation = Record<AllocationKey, number>

  const [allocation, setAllocation] = useState<Allocation>({
    data: 30,
    airtime: 15,
    sms: 10,
    voice: 0,
    whatsapp: 0,
  })

  const clampRands = (value: number) => Math.max(0, Math.min(1000, Math.round(value)))

  const setRands = (key: AllocationKey, value: number) => {
    setAllocation((prev) => ({ ...prev, [key]: clampRands(value) }))
  }

  const adjustRands = (key: AllocationKey, delta: number) => {
    setRands(key, allocation[key] + delta)
  }

  const parseRandsInput = (raw: string): number => {
    const onlyDigits = raw.replace(/[^\d]/g, '')
    return onlyDigits.length === 0 ? 0 : Number.parseInt(onlyDigits, 10)
  }

  const getDisplay = (serviceType: ServiceType, rands: number): string => {
    if (!serviceEnabled[serviceType]) return 'Not available yet'
    if (!isServiceAvailable(serviceType, packageType)) return 'Not available yet'

    const display = getServiceDisplayValue(serviceType, rands, packageType)
    if (!display) return 'Not available yet'

    // In this UI, airtime reads cleaner without the "airtime" suffix.
    if (serviceType === 'AIRTIME') return display.replace(/\s*airtime$/i, '')
    return display
  }

  const lineItems = [
    {
      key: 'data' as const,
      serviceType: 'DATA' as const,
      label: 'Mobile data',
      iconSrc: `${import.meta.env.BASE_URL}images/data_icon.svg`,
      bgClass: 'bg-[#FDDA36]',
      step: 5,
    },
    {
      key: 'airtime' as const,
      serviceType: 'AIRTIME' as const,
      label: 'Airtime',
      iconSrc: `${import.meta.env.BASE_URL}images/lime_icon_small.svg`,
      bgClass: 'bg-[#CDA7FC]',
      step: 5,
    },
    {
      key: 'sms' as const,
      serviceType: 'SMS' as const,
      label: 'SMS',
      iconSrc: `${import.meta.env.BASE_URL}images/sms_icon_small.svg`,
      bgClass: 'bg-[#5BA0FF]',
      step: 5,
    },
    {
      key: 'voice' as const,
      serviceType: 'VOICE' as const,
      label: 'Voice minutes',
      iconSrc: `${import.meta.env.BASE_URL}images/plan_phone.svg`,
      bgClass: 'bg-pink-300',
      step: 5,
    },
    {
      key: 'whatsapp' as const,
      serviceType: 'WHATSAPP' as const,
      label: 'WhatsApp',
      iconSrc: `${import.meta.env.BASE_URL}images/whatsapp_icon_small.svg`,
      bgClass: 'bg-[#ABFF63]',
      step: 5,
    },
  ]

  const activeSummaryItems = lineItems.filter(
    (item) => allocation[item.key] > 0 && serviceEnabled[item.serviceType] && isServiceAvailable(item.serviceType, packageType),
  )

  const totalRands = lineItems.reduce((sum, item) => sum + allocation[item.key], 0)

  return (
    <section id="why" className="mx-auto max-w-6xl px-6 pb-24 scroll-mt-24">
      <div className="flex items-center justify-center font-grotesque font-semibold text-neutral-400 text-[24px] sm:text-[30px] md:text-[36px] leading-[1.05]">
        <span className="w-2.5 h-2.5 rounded-full bg-purple-300 mr-3 translate-y-[1px]" /> Why People Choose Limes
      </div>

      <div className="mt-4 flex items-center justify-center">
        <h2 className="font-grotesque font-bold text-white text-[34px] sm:text-[44px] md:text-[56px] text-center leading-[1.05]">
          <span>For </span>
          <img src={`${import.meta.env.BASE_URL}images/people.png`} alt="people" className="inline-block align-middle h-10 sm:h-12 md:h-14 mx-2 -rotate-2" />
          <span> who want more flexibility</span>
        </h2>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <h3 className="font-grotesque font-bold text-neutral-400 text-[30px] sm:text-[36px] md:text-[44px] text-center leading-[1.05]">
          Build out your plan
        </h3>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-8 items-stretch">
        {/* Plan tiles */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-2 content-start self-stretch lg:h-[var(--plan-tiles-height)] lg:grid-rows-[132px_190px_190px]"
          style={{ ['--plan-tiles-height' as never]: `${planTilesHeightLgPx}px` }}
        >
          {lineItems.map((item) => {
            const isWide = item.key === 'data'
            const enabled = serviceEnabled[item.serviceType] && isServiceAvailable(item.serviceType, packageType)
            const rands = allocation[item.key]
            const display = getDisplay(item.serviceType, rands)

            return (
              <div
                key={item.key}
                className={`rounded-[26px] ${item.bgClass} shadow-[0_24px_70px_rgba(0,0,0,0.35)] flex flex-col justify-center gap-4 lg:h-[190px] ${
                  isWide ? 'p-5 sm:col-span-2 lg:h-full lg:px-4 lg:py-2' : 'p-5 lg:h-full'
                }`}
              >
                <div
                  className={`flex flex-col ${
                    isWide ? 'gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:gap-2' : 'gap-4'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {item.iconSrc ? (
                      <img src={item.iconSrc} alt={item.label} className="h-10 w-10" />
                    ) : (
                      <div className="h-10 w-10 grid place-items-center">
                        <svg className="h-10 w-10 text-neutral-900" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-grotesque font-bold text-neutral-900 text-[28px] md:text-[32px] leading-[0.95] tracking-tight">
                        {item.label}
                      </div>
                      <div className={`${isWide ? 'mt-0.5 lg:mt-0' : 'mt-0.5'} text-neutral-900/70 text-sm font-manrope`}>
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

        {/* Plan total */}
        <div
          className="rounded-[26px] bg-[#26252C] border border-white/10 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)] flex flex-col self-stretch h-full lg:h-[var(--plan-tiles-height)]"
          style={{ ['--plan-tiles-height' as never]: `${planTilesHeightLgPx}px` }}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-grotesque font-bold text-white text-2xl leading-tight">Your plan total</div>
              <div className="mt-1 text-white/60 text-sm font-manrope">Review your selections and continue.</div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-xs font-semibold uppercase tracking-wide">Total</div>
              <div className="mt-1 font-grotesque font-bold text-white text-4xl tracking-tight">R{totalRands}</div>
            </div>
          </div>

          <div className={`mt-6 flex-1 overflow-auto ${activeSummaryItems.length >= 4 ? 'space-y-3' : 'space-y-4'}`}>
            {activeSummaryItems.map((item) => (
              <div
                key={item.key}
                className={`rounded-2xl bg-white/6 border border-white/10 ${activeSummaryItems.length >= 4 ? 'p-3' : 'p-4'}`}
              >
                <div className="text-white/70 text-xs font-semibold">{item.label}</div>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <div className="text-white font-bold">{getDisplay(item.serviceType, allocation[item.key])}</div>
                  <div className="text-white/70 text-sm">R{allocation[item.key]}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <Link
              to="/signin"
              className="inline-flex items-center justify-between w-full rounded-2xl bg-[#ABFF63] text-neutral-900 font-semibold px-5 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,0.7)] border-2 border-black/70 hover:bg-[#ABFF63]/90 transition-colors"
            >
              <span>Squeeze &apos;em</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


