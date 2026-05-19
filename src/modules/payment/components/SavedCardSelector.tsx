import { useEffect, useState } from 'react'
import { CreditCard, Loader2, Plus, Star } from 'lucide-react'
import { paymentService } from '../services/paymentService'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import type { SavedCard } from '../../../types/payment'

interface SavedCardSelectorProps {
  selectedCardId: string | null // null = "Pay with new card"
  onSelect: (cardId: string | null) => void
  disabled?: boolean
}

function deduplicateCards(cardList: SavedCard[]): SavedCard[] {
  const cardMap = new Map<string, SavedCard>()

  cardList.forEach((card) => {
    const key = `${card.last4}-${card.expMonth}-${card.expYear}-${card.bank}`
    const existing = cardMap.get(key)
    if (!existing || card.isDefault || card.id > existing.id) {
      cardMap.set(key, card)
    }
  })

  return Array.from(cardMap.values())
}

export default function SavedCardSelector({
  selectedCardId,
  onSelect,
  disabled = false,
}: SavedCardSelectorProps) {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await paymentService.getSavedCards()
      const uniqueCards = deduplicateCards(data)
      setCards(uniqueCards)

      // Auto-select default card (or first card) if nothing pre-selected
      if (selectedCardId === undefined) {
        const defaultCard = uniqueCards.find((c) => c.isDefault)
        if (defaultCard) {
          onSelect(defaultCard.id)
        } else if (uniqueCards.length > 0) {
          onSelect(uniqueCards[0].id)
        }
      }
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, 'Failed to load saved cards'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
        <span className="text-sm text-neutral-500 font-manrope">Loading saved cards…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 p-3">
        <p className="text-sm text-red-400 font-manrope">{error}</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return null
  }

  const isSelected = (cardId: string | null) => selectedCardId === cardId

  return (
    <div className="space-y-3">
      <div className="font-grotesque text-neutral-400 text-sm font-semibold">Payment method</div>

      <div className="space-y-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelect(card.id)}
            disabled={disabled}
            className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
              isSelected(card.id)
                ? 'bg-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
                : 'bg-neutral-800 hover:bg-neutral-800'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected(card.id) ? 'border-[#ABFF63] bg-[#ABFF63]' : 'border-white/20'
              }`}
            >
              {isSelected(card.id) && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
            </div>

            <div className="flex-shrink-0 grid place-items-center rounded-lg bg-white/5" style={{ width: 36, height: 36 }}>
              <CreditCard className="w-5 h-5 text-neutral-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-grotesque font-bold text-white text-sm">
                  {card.brand.toUpperCase()} •••• {card.last4}
                </span>
                {card.isDefault && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-[#ABFF63] text-neutral-900 rounded-full">
                    <Star className="w-3 h-3 fill-current" />
                    Default
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5 font-manrope">
                Expires {card.expMonth}/{card.expYear} • {card.bank}
              </div>
            </div>
          </button>
        ))}

        {/* Pay with new card option */}
        <button
          onClick={() => onSelect(null)}
          disabled={disabled}
          className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all active:scale-[0.98] ${
            isSelected(null)
              ? 'bg-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
              : 'bg-neutral-800 hover:bg-neutral-800'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              isSelected(null) ? 'border-[#ABFF63] bg-[#ABFF63]' : 'border-white/20'
            }`}
          >
            {isSelected(null) && <div className="w-2 h-2 rounded-full bg-neutral-900" />}
          </div>

          <div className="flex-shrink-0 grid place-items-center rounded-lg bg-white/5" style={{ width: 36, height: 36 }}>
            <Plus className="w-5 h-5 text-neutral-300" />
          </div>

          <span className="font-grotesque font-bold text-white text-sm">Pay with new card</span>
        </button>
      </div>
    </div>
  )
}
