import { Check } from 'lucide-react'
import { SHIPPING_STEP_LABELS } from '../utils/warehouseStepper'

type Props = {
  activeIndex: number
  deliveryAttemptWarning?: boolean
  fullyComplete?: boolean
}

export function ShippingStepper({ activeIndex, deliveryAttemptWarning, fullyComplete }: Props) {
  const clamped = Math.min(Math.max(activeIndex, 0), SHIPPING_STEP_LABELS.length - 1)

  const stepDone = (i: number) => fullyComplete || i < clamped
  const stepCurrent = (i: number) => !fullyComplete && i === clamped

  return (
    <div className="w-full">
      <div className="flex flex-col gap-0 md:hidden">
        {SHIPPING_STEP_LABELS.map((label, i) => (
          <div key={label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  stepDone(i)
                    ? 'bg-[#ABFF63] text-neutral-900'
                    : stepCurrent(i)
                      ? 'bg-white text-neutral-900 ring-2 ring-[#ABFF63]'
                      : 'bg-neutral-800 text-neutral-500 ring-1 ring-white/10',
                ].join(' ')}
              >
                {stepDone(i) ? <Check className="h-5 w-5" strokeWidth={2.5} /> : i + 1}
              </div>
              {i < SHIPPING_STEP_LABELS.length - 1 && (
                <div
                  className={[
                    'my-1 min-h-[12px] w-px flex-1',
                    stepDone(i) ? 'bg-[#ABFF63]/80' : 'bg-neutral-700',
                  ].join(' ')}
                />
              )}
            </div>
            <div className="pb-6 pt-1.5">
              <p
                className={[
                  'text-sm font-semibold',
                  stepDone(i) || stepCurrent(i) ? 'text-white' : 'text-neutral-500',
                ].join(' ')}
              >
                {label}
              </p>
              {stepCurrent(i) && i === 4 && deliveryAttemptWarning && (
                <p className="mt-1 text-xs text-amber-400">
                  Delivery was attempted — check updates below.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <div className="flex items-start">
          {SHIPPING_STEP_LABELS.map((label, i, arr) => {
            const isLast = i === arr.length - 1
            return (
              <div key={label} className="flex min-w-0 flex-1 items-start">
                <div className="flex w-full min-w-0 flex-col items-center px-0.5">
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                      stepDone(i)
                        ? 'bg-[#ABFF63] text-neutral-900'
                        : stepCurrent(i)
                          ? 'bg-white text-neutral-900 ring-2 ring-[#ABFF63]'
                          : 'bg-neutral-800 text-neutral-500 ring-1 ring-white/10',
                    ].join(' ')}
                  >
                    {stepDone(i) ? <Check className="h-5 w-5" strokeWidth={2.5} /> : i + 1}
                  </div>
                  <p
                    className={[
                      'mt-2 max-w-[100px] text-center text-xs font-semibold leading-tight',
                      stepDone(i) || stepCurrent(i) ? 'text-white' : 'text-neutral-500',
                    ].join(' ')}
                  >
                    {label}
                  </p>
                  {stepCurrent(i) && i === 4 && deliveryAttemptWarning && (
                    <p className="mt-1 max-w-[140px] text-center text-[10px] leading-snug text-amber-400">
                      Attempted — see details
                    </p>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={[
                      'mt-5 h-0.5 min-w-[8px] flex-1 self-start',
                      stepDone(i) ? 'bg-[#ABFF63]/80' : 'bg-neutral-700',
                    ].join(' ')}
                    aria-hidden
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
