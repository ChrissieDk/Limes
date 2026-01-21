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
      color: 'bg-[#5BFFD8]',
      hoverColor: 'hover:bg-[#4AEEC7]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      key: 'voice' as const,
      name: 'Voice',
      color: 'bg-[#5BA0FF]',
      hoverColor: 'hover:bg-[#4A8FEE]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      key: 'sms' as const,
      name: 'SMS',
      color: 'bg-[#D8B0FF]',
      hoverColor: 'hover:bg-[#C79FEE]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
    },
    {
      key: 'whatsapp' as const,
      name: 'WhatsApp',
      color: 'bg-[#B8FF5B]',
      hoverColor: 'hover:bg-[#A7EE4A]',
      icon: (
        <svg className="w-8 h-8 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-neutral-800 text-white font-semibold hover:bg-neutral-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div>
          <h2 className="text-white font-extrabold text-3xl">Build Your Plan</h2>
          <p className="text-neutral-400 mt-1">Choose how much you want for each service</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {services.map((service) => {
          const value = allocation[service.key]
          const serviceTypeUpper = service.name.toUpperCase() as ServiceType
          const isAvailable = isServiceAvailable(serviceTypeUpper, packageType)
          const displayValue = isAvailable 
            ? getServiceDisplayValue(serviceTypeUpper, value, packageType)
            : null

          return (
            <div
              key={service.key}
              className={`rounded-2xl p-6 ${service.color} shadow-[8px_8px_0_0_rgba(0,0,0,0.7)] transition-all relative ${
                !isAvailable ? 'opacity-60' : ''
              }`}
            >
              {/* Coming Soon Badge */}
              {!isAvailable && (
                <div className="absolute top-4 right-4 bg-neutral-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Coming Soon
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="size-12 rounded-full bg-white/20 grid place-items-center">
                  {service.icon}
                </div>
                <div>
                  <h3 className="text-neutral-900 font-extrabold text-2xl">{service.name}</h3>
                  <p className="text-neutral-900/70 text-sm font-semibold">
                    {isAvailable ? `You'll get: ${displayValue}` : 'Not available yet'}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 ${!isAvailable ? 'pointer-events-none' : ''}`}>
                <button
                  onClick={() => adjustAllocation(service.key, -5)}
                  disabled={!isAvailable}
                  className="size-10 grid place-items-center rounded-xl bg-neutral-900/10 hover:bg-neutral-900/20 transition-colors font-bold text-neutral-900 text-xl disabled:opacity-50"
                >
                  −
                </button>

                <div className="flex-1 flex items-center justify-center gap-1 bg-white/20 rounded-xl px-4 py-3">
                  <span className="font-extrabold text-3xl text-neutral-900">R</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => handleInputChange(service.key, e.target.value)}
                    disabled={!isAvailable}
                    className="w-20 text-center font-extrabold text-3xl text-neutral-900 bg-transparent border-0 outline-none p-0 disabled:opacity-50"
                    style={{ appearance: 'none' }}
                  />
                </div>

                <button
                  onClick={() => adjustAllocation(service.key, 5)}
                  disabled={!isAvailable}
                  className="size-10 grid place-items-center rounded-xl bg-neutral-900/10 hover:bg-neutral-900/20 transition-colors font-bold text-neutral-900 text-xl disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Total and Continue */}
      <div className="rounded-2xl bg-white p-8 shadow-[8px_8px_0_0_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-neutral-900 font-extrabold text-2xl mb-1">Your Plan Total</h3>
            <p className="text-neutral-600">Review your selections and continue</p>
          </div>
          <div className="text-right">
            <div className="text-neutral-600 text-sm font-semibold mb-1">Total</div>
            <div className="text-neutral-900 font-extrabold text-5xl">R{totalPrice}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {services.map((service) => {
            const value = allocation[service.key]
            if (value === 0) return null
            
            const serviceTypeUpper = service.name.toUpperCase() as ServiceType
            const isAvailable = isServiceAvailable(serviceTypeUpper, packageType)
            const displayValue = isAvailable 
              ? getServiceDisplayValue(serviceTypeUpper, value, packageType)
              : 'Coming Soon'

            return (
              <div key={service.key} className="rounded-xl bg-neutral-50 p-4">
                <div className="text-neutral-600 text-xs font-semibold mb-1">{service.name}</div>
                <div className="text-neutral-900 font-bold text-lg">{displayValue}</div>
                <div className="text-neutral-500 text-sm">R{value}</div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => onContinue(allocation)}
          disabled={totalPrice === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-extrabold text-lg px-6 py-4 hover:bg-lime-300 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_rgba(0,0,0,0.7)]"
        >
          <span>Continue to Payment</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
