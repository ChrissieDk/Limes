import { useState } from 'react'
import { getServiceDisplayValue, isServiceAvailable } from '../../payment/utils/dynamicPricing'
import type { ServiceType } from '../../payment/utils/dynamicPricing'
import type { PackageType } from '../../payment/config/ratingTable'

interface ServiceAllocation {
  data: number
  voice: number
  sms: number
  whatsapp: number
}

interface PlanBuilderProps {
  onContinue: (allocation: ServiceAllocation) => void
  onBack: () => void
}

export default function PlanBuilder({ onContinue, onBack }: PlanBuilderProps) {
  // Plan builder is for contract packages
  const packageType: PackageType = 'contract'
  
  const [allocation, setAllocation] = useState<ServiceAllocation>({
    data: 50,
    voice: 20,
    sms: 10,
    whatsapp: 0, // Default to 0 for coming soon services
  })

  const updateAllocation = (service: keyof ServiceAllocation, value: number) => {
    setAllocation((prev) => ({
      ...prev,
      [service]: Math.max(0, Math.min(1000, value)),
    }))
  }

  const adjustAllocation = (service: keyof ServiceAllocation, delta: number) => {
    updateAllocation(service, allocation[service] + delta)
  }

  const handleInputChange = (service: keyof ServiceAllocation, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value.replace(/[^0-9]/g, ''), 10)
    updateAllocation(service, numValue)
  }

  // Only include available services in total price calculation
  const totalPrice = 
    (isServiceAvailable('DATA', packageType) ? allocation.data : 0) +
    (isServiceAvailable('VOICE', packageType) ? allocation.voice : 0) +
    (isServiceAvailable('SMS', packageType) ? allocation.sms : 0) +
    (isServiceAvailable('WHATSAPP', packageType) ? allocation.whatsapp : 0)

  const services = [
    {
      key: 'data' as const,
      name: 'Data',
      color: 'bg-[#ABFF63]',
      hoverColor: 'hover:brightness-95',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: 'voice' as const,
      name: 'Voice',
      color: 'bg-[#CDA7FC]',
      hoverColor: 'hover:brightness-95',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      key: 'sms' as const,
      name: 'SMS',
      color: 'bg-[#629BFC]',
      hoverColor: 'hover:brightness-95',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      key: 'whatsapp' as const,
      name: 'WhatsApp',
      color: 'bg-pink-300',
      hoverColor: 'hover:brightness-95',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
  ]

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {services.map((service) => {
          const value = allocation[service.key]
          const serviceTypeUpper = service.name.toUpperCase() as ServiceType
          const isAvailable = isServiceAvailable(serviceTypeUpper, packageType)
          const displayValue = isAvailable 
            ? getServiceDisplayValue(serviceTypeUpper, value, packageType)
            : null
          const displayName =
            service.key === 'data'
              ? 'Mobile data'
              : service.key === 'voice'
              ? 'Airtime'
              : service.name

          return (
            <div
              key={service.key}
              className={`rounded-[28px] p-7 ${service.color} shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all relative ${
                !isAvailable ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="text-neutral-900">{service.icon}</div>
                <div className="min-w-0">
                  <h3 className="text-neutral-900 font-bold text-[30px] leading-[1.05] tracking-tight">
                    {displayName}
                  </h3>
                  <p className="mt-0.5 text-neutral-900/70 text-sm font-semibold">
                    {isAvailable ? (
                      <>
                        <span>You&apos;ll get: </span>
                        <span className="font-extrabold text-neutral-900">{displayValue}</span>
                      </>
                    ) : (
                      'Not available yet'
                    )}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-4 ${!isAvailable ? 'pointer-events-none' : ''}`}>
                <button
                  onClick={() => adjustAllocation(service.key, -5)}
                  disabled={!isAvailable}
                  className="size-12 grid place-items-center rounded-2xl bg-black/10 hover:bg-black/15 transition-colors font-semibold text-neutral-900 text-3xl disabled:opacity-50"
                >
                  −
                </button>

                <div className="flex-1 flex items-center justify-center gap-4 bg-white/35 rounded-2xl px-6 py-3">
                  <span className="font-grotesque font-bold text-[40px] leading-[0.9] text-neutral-900 tracking-tight">
                    R
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => handleInputChange(service.key, e.target.value)}
                    disabled={!isAvailable}
                    className="w-[4ch] text-center font-grotesque font-bold text-[40px] leading-[0.9] text-neutral-900 tracking-tight bg-transparent border-0 outline-none p-0 disabled:opacity-50"
                    style={{ appearance: 'none' }}
                  />
                </div>

                <button
                  onClick={() => adjustAllocation(service.key, 5)}
                  disabled={!isAvailable}
                  className="size-12 grid place-items-center rounded-2xl bg-black/10 hover:bg-black/15 transition-colors font-semibold text-neutral-900 text-3xl disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total and Continue */}
      <div className="rounded-[28px] bg-neutral-900/40 ring-1 ring-white/10 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h3 className="text-white font-semibold text-[28px] leading-[1.1] mb-1">Your plan total</h3>
            <p className="text-neutral-400 text-sm">Review your selections and continue.</p>
          </div>
          <div className="text-right">
            <div className="text-neutral-400 text-xs font-semibold mb-1">Total</div>
            <div className="text-white font-semibold text-[40px] leading-[1]">R{totalPrice}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {services.map((service) => {
            const value = allocation[service.key]
            if (value === 0) return null
            
            const serviceTypeUpper = service.name.toUpperCase() as ServiceType
            const isAvailable = isServiceAvailable(serviceTypeUpper, packageType)
            const displayValue = isAvailable 
              ? getServiceDisplayValue(serviceTypeUpper, value, packageType)
              : 'Coming Soon'
            const displayName =
              service.key === 'data'
                ? 'Mobile data'
                : service.key === 'voice'
                ? 'Voice minutes'
                : service.name

            return (
              <div key={service.key} className="rounded-2xl bg-white/10 ring-1 ring-white/10 p-4">
                <div className="text-neutral-300 text-xs font-semibold mb-1">{displayName}</div>
                <div className="text-white font-semibold text-lg">{displayValue}</div>
                <div className="text-neutral-400 text-sm">R{value}</div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onContinue(allocation)}
          disabled={totalPrice === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ABFF63] text-neutral-900 font-semibold text-sm px-6 py-3 hover:brightness-95 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue to payment</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
