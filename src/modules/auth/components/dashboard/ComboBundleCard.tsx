import type { EnrichedComboPackage } from '../../../catalog/utils/packageEnricher'

interface ComboBundleCardProps {
  bundle: EnrichedComboPackage
  colorClass: string
  onSelect: (bundle: EnrichedComboPackage) => void
}

export default function ComboBundleCard({ bundle, colorClass, onSelect }: ComboBundleCardProps) {
  const benefits = bundle.comboDetails?.benefits ?? []
  const includedRows: Array<{ key: string; label: string; value: string; meta?: string }> = []

  const pick = (type: (typeof benefits)[number]['type']) => benefits.find((b) => b.type === type)

  const standardData = pick('data')
  const promoData = pick('promo_data')
  const zeroRatedData = pick('zero_rated_data')
  const whatsapp = pick('whatsapp')
  const voice = pick('voice')
  const sms = pick('sms')
  const airtime = pick('gpa_credit')

  if (standardData) {
    includedRows.push({ key: 'data', label: 'Data', value: standardData.formattedValue, meta: standardData.validity })
  }
  if (promoData) {
    includedRows.push({ key: 'promo_data', label: 'Bonus data', value: promoData.formattedValue, meta: promoData.validity })
  }
  if (zeroRatedData) {
    includedRows.push({ key: 'zero_rated_data', label: 'Zero-rated', value: zeroRatedData.formattedValue, meta: zeroRatedData.validity })
  }
  if (whatsapp) {
    includedRows.push({ key: 'whatsapp', label: 'WhatsApp', value: whatsapp.formattedValue, meta: whatsapp.validity })
  }
  if (voice) {
    includedRows.push({ key: 'voice', label: 'Voice', value: voice.formattedValue, meta: voice.validity })
  }
  if (sms) {
    includedRows.push({ key: 'sms', label: 'SMS', value: sms.formattedValue, meta: sms.validity })
  }
  if (airtime) {
    includedRows.push({ key: 'gpa_credit', label: 'Airtime', value: airtime.formattedValue, meta: airtime.validity })
  }

  return (
    <div
      className={`rounded-[28px] p-8 ${colorClass} shadow-[0_24px_70px_rgba(0,0,0,0.35)] transition-all group relative overflow-hidden min-h-[230px] flex flex-col`}
    >
      <div className="font-grotesque text-neutral-900 font-bold text-[24px] md:text-[26px] leading-[1.1] tracking-tight">
        {bundle.name}
      </div>
      <div className="mt-4 h-[2px] w-full bg-neutral-900/30" />

      <div className="mt-5 flex-1">
        {includedRows.length > 0 ? (
          <div className="space-y-1.5">
            {includedRows.map((row) => (
              <div key={row.key} className="flex items-baseline justify-between gap-4">
                <span className="font-manrope text-neutral-900/80 text-sm font-semibold whitespace-nowrap">
                  {row.label}
                  {row.meta ? <span className="text-neutral-900/60 font-semibold"> ({row.meta})</span> : null}
                </span>
                <span className="font-grotesque text-neutral-900 text-sm font-bold whitespace-nowrap">{row.value}</span>
              </div>
            ))}
          </div>
        ) : bundle.comboDetails?.shortSummary ? (
          <p className="font-manrope text-neutral-900/80 text-sm font-semibold">{bundle.comboDetails.shortSummary}</p>
        ) : null}
      </div>

      <div className="mt-auto pt-6">
        <div className="font-grotesque text-neutral-900 font-bold text-[34px] md:text-[38px] leading-none tracking-tight">
          R{bundle.actualPrice.toFixed(2)}
        </div>
        <div className="mt-5">
          <button
            onClick={() => onSelect(bundle)}
            className="inline-flex items-center justify-center h-10 px-6 rounded-[12px] bg-white text-neutral-900 text-sm font-semibold border border-neutral-900/50 hover:bg-neutral-50 transition-colors"
          >
            Buy now
          </button>
        </div>
      </div>
    </div>
  )
}
