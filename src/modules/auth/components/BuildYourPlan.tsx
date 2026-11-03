import { useState } from 'react'
import { Link } from 'react-router'
import { useAuthLandingCtaPath } from '../hooks/useAuthLandingCtaPath'

type Item = {
  id: string
  label: string
  summaryLabel: string
  unit: string
  step: number
  min: number
  initial: number
  // mock pricing: rand per unit
  rate: number
  color: string
  wide?: boolean
}

// TODO: replace mock items/rates with API data
const items: Item[] = [
  { id: 'airtime', label: 'Airtime', summaryLabel: 'Airtime', unit: 'R', step: 10, min: 0, initial: 30, rate: 1, color: 'bg-[#BDFF6E]', wide: true },
  { id: 'data', label: 'Mobile data', summaryLabel: 'Mobile Data', unit: 'GB', step: 5, min: 0, initial: 30, rate: 100 / 30, color: 'bg-yellow-300' },
  { id: 'sms', label: 'SMS', summaryLabel: 'SMSs', unit: '', step: 5, min: 0, initial: 25, rate: 10 / 25, color: 'bg-blue-400' },
  { id: 'voice', label: 'Voice min', summaryLabel: 'Voice Minutes', unit: '', step: 6, min: 0, initial: 102, rate: 10 / 102, color: 'bg-pink-300' },
  { id: 'whatsapp', label: 'WhatsApp', summaryLabel: 'WhatsApp', unit: 'GB', step: 1, min: 0, initial: 10, rate: 1, color: 'bg-purple-300' },
]

const priceOf = (item: Item, value: number) => Math.round(value * item.rate)

export default function BuildYourPlan() {
  const buyPath = useAuthLandingCtaPath('/signup')
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.initial])),
  )

  const change = (item: Item, dir: 1 | -1) =>
    setValues((v) => ({ ...v, [item.id]: Math.max(item.min, v[item.id] + dir * item.step) }))

  const total = items.reduce((sum, i) => sum + priceOf(i, values[i.id]), 0)

  return (
    <section id="build" className="px-6 py-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-center gap-2 font-manrope text-sm text-neutral-400">
          <span className="size-1.5 rounded-full bg-pink-300" />
          Squeeze it your way
        </div>
        <h2 className="font-manrope mt-4 text-center text-[28px] font-bold! leading-[1.15] text-white sm:text-[32px] md:text-[36px]">
          Or build out your plan
        </h2>
        <p className="font-manrope mt-3 text-center text-sm text-white md:text-base">
          Get only what you need every month. Cancel anytime.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-lg p-4 text-neutral-900 ${item.color} ${item.wide ? 'sm:col-span-2' : ''}`}
              >
                <div>
                  <p className="font-manrope text-base font-bold">{item.label}</p>
                  <p className="font-manrope text-xs">You pay R{priceOf(item, values[item.id])}</p>
                </div>
                <div className="flex h-12 w-44 items-center justify-between rounded-md bg-white/70 px-2 sm:w-52">
                  <button type="button" aria-label={`Decrease ${item.label}`} onClick={() => change(item, -1)} className="size-8 cursor-pointer text-2xl leading-none">
                    −
                  </button>
                  <span className="font-manrope text-xl font-bold">
                    {item.unit === 'R' ? `R${values[item.id]}` : `${values[item.id]}${item.unit}`}
                  </span>
                  <button type="button" aria-label={`Increase ${item.label}`} onClick={() => change(item, 1)} className="size-8 cursor-pointer text-2xl leading-none">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center">
            <div className="flex w-full items-start justify-between">
              <div>
                <h3 className="font-manrope text-lg font-bold! text-white">Your plan total</h3>
                <p className="font-manrope text-xs text-neutral-300">Review your selections and continue.</p>
              </div>
              <div className="text-right">
                <p className="font-manrope text-[11px] text-neutral-400">Total</p>
                <p className="font-manrope text-xl font-bold text-[#ABFF63]">R{total}</p>
              </div>
            </div>
            <ul className="mt-4 w-full space-y-2.5 rounded-lg bg-[#302F35] p-4">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between font-manrope text-white">
                  <span className="text-xs">{item.summaryLabel}</span>
                  <span className="text-base font-semibold">R{priceOf(item, values[item.id])}</span>
                </li>
              ))}
            </ul>
            <Link
              to={buyPath}
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#ABFF63] px-5 font-manrope text-sm font-semibold text-neutral-900 transition-colors hover:bg-[#99FF4D]"
            >
              Buy now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
