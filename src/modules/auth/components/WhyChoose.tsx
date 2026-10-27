import { useState } from 'react'
import { Link } from 'react-router'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'
import { getServiceDisplayValue, isServiceAvailable } from '../../payment/utils/dynamicPricing'
import type { ServiceType } from '../../payment/config/ratingTable'
import type { PackageType } from '../../payment/config/ratingTable'

const base = import.meta.env.BASE_URL

export default function WhyChoose() {
  const ctaPath = useAuthLandingCtaPath('/signup')
  const packageType: PackageType = 'prepaid'

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
    data: 100,
    airtime: 30,
    sms: 10,
    voice: 10,
    whatsapp: 10,
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

    if (serviceType === 'AIRTIME') return display.replace(/\s*airtime$/i, '')
    return display
  }

  const getStepperValue = (serviceType: ServiceType, rands: number): string => {
    if (serviceType === 'AIRTIME') return `R${rands}`

    const display = getDisplay(serviceType, rands)
    if (serviceType === 'DATA' || serviceType === 'WHATSAPP') {
      return display.replace(/\s+/g, '').replace(/\.0GB/i, 'GB')
    }
    if (serviceType === 'VOICE') return display.replace(/\s*min/i, '').trim()
    if (serviceType === 'SMS') return display.replace(/\s*SMS/i, '').trim()
    return display
  }

  const lineItems = [
    {
      key: 'airtime' as const,
      serviceType: 'AIRTIME' as const,
      label: 'Airtime',
      summaryLabel: 'Airtime',
      iconSrc: `${base}images/lime_icon_small.svg`,
      bgClass: 'bg-[#ABFF63]',
      step: 5,
      wide: true,
    },
    {
      key: 'data' as const,
      serviceType: 'DATA' as const,
      label: 'Mobile data',
      summaryLabel: 'Mobile Data',
      iconSrc: `${base}images/data_icon.svg`,
      bgClass: 'bg-[#FDDA36]',
      step: 5,
      wide: false,
    },
    {
      key: 'sms' as const,
      serviceType: 'SMS' as const,
      label: 'SMS',
      summaryLabel: 'SMSs',
      iconSrc: `${base}images/sms_icon_small.svg`,
      bgClass: 'bg-[#629BFC]',
      step: 5,
      wide: false,
    },
    {
      key: 'voice' as const,
      serviceType: 'VOICE' as const,
      label: 'Voice min',
      summaryLabel: 'Voice Minutes',
      iconSrc: `${base}images/plan_phone.svg`,
      bgClass: 'bg-pink-300',
      step: 5,
      wide: false,
    },
    {
      key: 'whatsapp' as const,
      serviceType: 'WHATSAPP' as const,
      label: 'WhatsApp',
      summaryLabel: 'WhatsApp',
      iconSrc: `${base}images/whatsapp_icon_small.svg`,
      bgClass: 'bg-[#CDA7FC]',
      step: 5,
      wide: false,
    },
  ]

  const totalRands = lineItems.reduce((sum, item) => sum + allocation[item.key], 0)

  return (
    <section id="why" className="scroll-mt-24 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-pink-300" />
          Squeeze it your way
        </div>

        <h2 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] tracking-normal text-white sm:text-[32px] md:text-[36px]">
          Build out your plan
        </h2>
        <p className="font-manrope mt-3 text-center text-sm text-neutral-400 md:text-base">
          Get only what you need every month. Cancel anytime.
        </p>

        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 sm:grid-rows-3">
            {lineItems.map((item) => {
              const enabled = serviceEnabled[item.serviceType] && isServiceAvailable(item.serviceType, packageType)
              const rands = allocation[item.key]
              const stepperValue = getStepperValue(item.serviceType, rands)
              const isAirtime = item.key === 'airtime'

              return (
                <div
                  key={item.key}
                  className={`flex h-full flex-col justify-center gap-3 rounded-xl px-4 py-5 sm:px-5 sm:py-6 ${item.bgClass} ${
                    item.wide ? 'sm:col-span-2 sm:flex-row sm:items-center sm:justify-between' : ''
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={item.iconSrc} alt="" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
                    <div className="min-w-0">
                      <div className="font-manrope text-lg font-bold! leading-tight text-neutral-900 sm:text-xl">{item.label}</div>
                      <div className="font-manrope whitespace-nowrap text-sm text-neutral-900/70 sm:text-base">You pay R{rands}</div>
                    </div>
                  </div>

                  <div
                    className={`flex h-14 w-full shrink-0 items-center rounded-md bg-white/70 sm:h-16 ${enabled ? '' : 'opacity-70'} ${
                      item.wide ? 'sm:w-[min(100%,340px)]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      aria-label={`Decrease ${item.label}`}
                      disabled={!enabled}
                      onClick={() => adjustRands(item.key, -item.step)}
                      className="grid h-full w-14 place-items-center font-manrope text-5xl font-medium leading-none text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-16 sm:text-6xl"
                    >
                      −
                    </button>
                    <div className="flex min-w-0 flex-1 items-center justify-center px-1">
                      {isAirtime ? (
                        <>
                          <label className="sr-only" htmlFor={`plan-${item.key}`}>
                            {item.label} amount in rands
                          </label>
                          <input
                            id={`plan-${item.key}`}
                            type="text"
                            inputMode="numeric"
                            value={`R${rands}`}
                            onChange={(e) => setRands(item.key, parseRandsInput(e.target.value))}
                            disabled={!enabled}
                            className="w-full border-0 bg-transparent p-0 text-center font-manrope text-[28px] font-bold! leading-none text-neutral-900 outline-none disabled:opacity-60 sm:text-[30px]"
                          />
                        </>
                      ) : (
                        <span className="font-manrope text-[28px] font-bold! leading-none text-neutral-900 sm:text-[30px]">
                          {stepperValue}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Increase ${item.label}`}
                      disabled={!enabled}
                      onClick={() => adjustRands(item.key, item.step)}
                      className="grid h-full w-14 place-items-center font-manrope text-5xl font-medium leading-none text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-16 sm:text-6xl"
                    >
                      +
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-manrope text-lg font-bold! text-white">Your plan total</h3>
                <p className="font-manrope mt-1 text-sm text-neutral-400">Review your selections and continue.</p>
              </div>
              <div className="text-right">
                <div className="font-manrope text-xs text-neutral-400">Total</div>
                <div className="font-manrope mt-0.5 text-2xl font-bold! text-[#ABFF63]">R{totalRands}</div>
              </div>
            </div>

            <div className="mt-4 min-h-[148px] flex-1 rounded-2xl px-5 py-5" style={{ backgroundColor: '#302F35' }}>
              <dl className="flex h-full flex-col justify-between gap-3">
                {(['airtime', 'data', 'voice', 'sms', 'whatsapp'] as const).map((key) => {
                  const item = lineItems.find((line) => line.key === key)
                  if (!item) return null
                  return (
                    <div key={item.key} className="flex items-center justify-between gap-3">
                      <dt className="font-manrope text-sm text-neutral-400">{item.summaryLabel}</dt>
                      <dd className="font-manrope text-xl font-bold! text-white sm:text-2xl">R{allocation[item.key]}</dd>
                    </div>
                  )
                })}
              </dl>
            </div>

            <div className="mt-4 flex justify-center">
              <Link
                to={ctaPath}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#ABFF63] px-5 font-manrope text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#99FF4D]"
              >
                Buy now
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
