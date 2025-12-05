import { useEffect, useMemo, useState } from 'react'

type TopUpKind = 'data' | 'airtime' | 'bundles'
type EntryMode = 'price' | 'quantity'

interface TopUpModalProps {
  open: boolean
  onClose: () => void
  initialKind?: TopUpKind
  phoneNumber?: string
  phoneNumbers?: string[]
}

export default function TopUpModal({ open, onClose, initialKind = 'data', phoneNumber, phoneNumbers }: TopUpModalProps) {
  const [kind, setKind] = useState<TopUpKind>(initialKind)
  const [entryMode, setEntryMode] = useState<EntryMode>('price')
  const [priceValue, setPriceValue] = useState<number>(100)
  const [dataQty, setDataQty] = useState<number>(5)
  const [dataUnit, setDataUnit] = useState<'GB' | 'MB'>('GB')
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'card' | 'eft'>('wallet')
  const [isPhoneMenuOpen, setIsPhoneMenuOpen] = useState(false)
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>(phoneNumber ?? (phoneNumbers?.[0] ?? '+27 71 223 4455'))
  const [selectedBundle, setSelectedBundle] = useState<string>('limes99')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    setKind(initialKind)
  }, [initialKind])

  useEffect(() => {
    setSelectedPhoneNumber(phoneNumber ?? (phoneNumbers?.[0] ?? '+27 71 223 4455'))
  }, [phoneNumber, phoneNumbers])

  const formattedPrice = useMemo(() => `R${priceValue.toFixed(2)}`.replace(/\.00$/, ''), [priceValue])

  const adjustPrice = (delta: number) => setPriceValue((v) => Math.max(0, Math.round((v + delta) * 100) / 100))
  const adjustData = (delta: number) => setDataQty((v) => Math.max(0, v + delta))

  const bundles = useMemo(() => ([
    { id: 'limes99', name: 'Limes99', icon: 'plan_logo.png', features: ['R99 airtime + R31 FREE', 'Unlimited WhatsApp text'] },
    { id: 'limes29', name: 'Limes29', icon: 'sms.png', features: ['R29 airtime + R6 FREE', 'Unlimited WhatsApp text'] },
    { id: 'limes69', name: 'Limes69', icon: 'star.png', features: ['R69 airtime + R21 FREE', 'Unlimited WhatsApp text'] },
  ]), [])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg sm:max-w-xl mx-0 sm:mx-4 rounded-2xl bg-white text-neutral-900 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[82vh] sm:max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center size-8 rounded-lg bg-neutral-900 text-white">▣</div>
            <div>
              <div className="font-extrabold text-lg">Top-up</div>
              <div className="text-sm text-neutral-500">Enter the details below to top-up</div>
            </div>
          </div>
          <button aria-label="Close" className="size-10 grid place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 text-2xl" onClick={onClose}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-5 space-y-5">
          <div className="flex items-center justify-center gap-3">
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'data' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('data')}>Data</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'airtime' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('airtime')}>Airtime</button>
            <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${kind === 'bundles' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700'}`} onClick={() => setKind('bundles')}>Bundles</button>
          </div>

          {kind !== 'bundles' && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <span>Switch to</span>
              {entryMode === 'price' ? (
                <button className="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700" onClick={() => setEntryMode('quantity')}>{kind === 'data' ? 'Data' : 'Cost Price'}</button>
              ) : (
                <button className="px-2 py-0.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700" onClick={() => setEntryMode('price')}>Cost Price</button>
              )}
            </div>
          )}

          {kind !== 'bundles' && (entryMode === 'price' ? (
            <div className="flex items-center justify-center gap-4 select-none">
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustPrice(-10)}>−</button>
              <div className="font-grotesque font-extrabold text-6xl tracking-tight">{formattedPrice}</div>
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustPrice(10)}>+</button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 select-none">
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustData(-1)}>−</button>
              <div className="flex items-center gap-2">
                <div className="font-grotesque font-extrabold text-6xl tracking-tight">{dataQty}</div>
                {kind === 'data' && (
                  <div className="relative">
                    <select className="appearance-none bg-neutral-100 text-neutral-700 rounded-lg px-2 py-1 text-sm" value={dataUnit} onChange={(e) => setDataUnit(e.target.value as 'GB' | 'MB')}>
                      <option value="GB">GB</option>
                      <option value="MB">MB</option>
                    </select>
                  </div>
                )}
              </div>
              <button className="size-10 grid place-items-center rounded-xl ring-1 ring-neutral-200 hover:bg-neutral-100" onClick={() => adjustData(1)}>+</button>
            </div>
          ))}

          {kind !== 'bundles' && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-lime-100 text-lime-700 px-3 py-1 text-sm">Save R20!</span>
              {entryMode === 'price' && <span className="text-neutral-500 text-sm">{formattedPrice}.00</span>}
            </div>
          )}

          <div className="space-y-3">
            <div className={`rounded-xl border-2 ${selectedMethod === 'wallet' ? 'border-neutral-900' : 'border-neutral-200'} bg-lime-400/80 px-4 py-3 text-neutral-900`}
                 onClick={() => setSelectedMethod('wallet')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center size-9 rounded-lg bg-neutral-900/10">▣</div>
                  <div>
                    <div className="font-semibold">Wallet</div>
                    <div className="text-sm">Total: R230.60</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-white text-neutral-900 px-3 py-1.5 text-sm ring-2 ring-neutral-900/90">Apply max amount</button>
                  <span className={`size-4 rounded-full ${selectedMethod === 'wallet' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl border ${selectedMethod === 'card' ? 'border-neutral-900' : 'border-neutral-200'} px-4 py-3 cursor-pointer`} onClick={() => setSelectedMethod('card')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded bg-red-500 inline-block" />
                  <div>
                    <div className="font-medium">Mastercard ending in 1234</div>
                    <div className="text-sm text-neutral-500">Expiry 06/2028</div>
                  </div>
                </div>
                <span className={`size-4 rounded-full ${selectedMethod === 'card' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
              </div>
            </div>

            <div className={`rounded-xl border ${selectedMethod === 'eft' ? 'border-neutral-900' : 'border-neutral-200'} px-4 py-3 cursor-pointer`} onClick={() => setSelectedMethod('eft')}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="size-6 rounded bg-emerald-400 inline-block" />
                  <div>
                    <div className="font-medium">Instant EFT</div>
                    <div className="text-sm text-neutral-500">Credit or debit card</div>
                  </div>
                </div>
                <span className={`size-4 rounded-full ${selectedMethod === 'eft' ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
              </div>
            </div>
          </div>

          {kind === 'bundles' && (
            <div className="space-y-3">
              {bundles.map((b) => (
                <div key={b.id} className={`rounded-xl border ${selectedBundle === b.id ? 'border-neutral-900' : 'border-neutral-200'} px-4 py-3 cursor-pointer`} onClick={() => setSelectedBundle(b.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={`${import.meta.env.BASE_URL}images/${b.icon}`} alt="bundle" className="h-6 w-6" />
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-sm text-neutral-500">{b.features[0]}</div>
                        <div className="text-sm text-neutral-500">{b.features[1]}</div>
                      </div>
                    </div>
                    <span className={`size-4 rounded-full ${selectedBundle === b.id ? 'bg-neutral-900' : 'bg-white ring-1 ring-neutral-300'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-neutral-600 text-sm">Phone number to top-up</div>
            <div className="relative">
              <button className="w-full flex items-center gap-2 rounded-xl ring-1 ring-neutral-300 px-3 py-2 bg-white text-left" onClick={() => setIsPhoneMenuOpen((v) => !v)}>
                <img src={`${import.meta.env.BASE_URL}images/plan_logo.png`} alt="limes" className="h-6 w-6" />
                <span className="flex-1 text-neutral-900">{selectedPhoneNumber}</span>
                <span className={`text-neutral-400 transition-transform text-2xl leading-none ${isPhoneMenuOpen ? 'rotate-180' : ''}`}>▾</span>
              </button>
              {isPhoneMenuOpen && (
                <div className="absolute left-0 right-0 mt-1 z-10 rounded-xl bg-white ring-1 ring-neutral-200 shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {(phoneNumbers && phoneNumbers.length > 0 ? phoneNumbers : [selectedPhoneNumber]).map((num) => (
                    <button key={num} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-100 text-left" onClick={() => { setSelectedPhoneNumber(num); setIsPhoneMenuOpen(false) }}>
                      <span className="inline-flex items-center justify-center size-6 rounded bg-yellow-400 text-neutral-900 text-xs font-bold">SIM</span>
                      <span className="text-neutral-900">{num}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-lime-400 text-neutral-900 font-semibold px-5 py-2.5 hover:bg-lime-300 active:scale-[0.99] transition">
              <span>Top-up</span>
              <span>→</span>
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}


