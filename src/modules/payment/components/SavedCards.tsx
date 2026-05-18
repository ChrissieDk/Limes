import { useEffect, useState } from 'react'
import { CreditCard, Trash2, Loader2, AlertCircle, CheckCircle2, Star, FileText } from 'lucide-react'
import { paymentService } from '../services/paymentService'
import { getAxiosErrorMessage } from '../../../utils/errorMessage'
import { toCents } from '../utils/dynamicPricing'
import { trackPurchase } from '../../analytics/services/analyticsService'
import type { SavedCard } from '../../../types/payment'

interface SavedCardsProps {
  onCardSelected?: (cardId: string) => void
  showChargeButton?: boolean
  chargeAmount?: number
}

export default function SavedCards({
  onCardSelected,
  showChargeButton = false,
  chargeAmount,
}: SavedCardsProps) {
  const [cards, setCards] = useState<SavedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [chargingCardId, setChargingCardId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, 'Failed to load saved cards'))
    } finally {
      setLoading(false)
    }
  }

  const deduplicateCards = (cardList: SavedCard[]): SavedCard[] => {
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

  const handleSetDefaultCard = async (cardId: string) => {
    setSettingDefaultId(cardId)
    setError(null)

    try {
      await paymentService.setDefaultCard(cardId)
      setCards(cards.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      })))
      setSuccessMessage('Default card updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, 'Failed to set default card'))
    } finally {
      setSettingDefaultId(null)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return
    }

    setDeletingCardId(cardId)
    setError(null)

    try {
      await paymentService.deleteSavedCard(cardId)
      setCards(cards.filter((c) => c.id !== cardId))
      setSuccessMessage('Card deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, 'Failed to delete card'))
    } finally {
      setDeletingCardId(null)
    }
  }

  const handleChargeCard = async (cardId: string) => {
    if (!chargeAmount) return

    setChargingCardId(cardId)
    setError(null)

    try {
      const response = await paymentService.chargeSavedCard({
        paymentMethodId: cardId,
        amount: toCents(chargeAmount),
      })

      if (response.success) {
        setSuccessMessage(`Payment of R${chargeAmount} successful!`)
        setTimeout(() => setSuccessMessage(null), 3000)
        if (onCardSelected) {
          onCardSelected(cardId)
        }
        if (response.transaction) {
          trackPurchase({
            transactionId: response.transaction.reference,
            value: chargeAmount,
            currency: response.transaction.currency || 'ZAR',
            items: [
              {
                item_id: response.transaction.reference,
                item_name: 'Saved Card Payment',
                price: chargeAmount,
                quantity: 1,
              },
            ],
            paymentType: response.transaction.channel || 'card',
          })
        }
      } else {
        setError(response.error || 'Payment failed')
      }
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, 'Failed to charge card'))
    } finally {
      setChargingCardId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#ABFF63]" />
        <span className="ml-3 text-neutral-400 font-manrope">Loading saved cards...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-[#ABFF63]/10 rounded-xl text-[#ABFF63]">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium font-manrope">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium font-manrope">{error}</span>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="rounded-[26px] bg-neutral-800 px-6 py-14 text-center">
          <FileText className="w-7 h-7 text-neutral-400 mx-auto mb-4" />
          <div className="text-white font-grotesque font-semibold">No saved cards</div>
          <div className="font-manrope mt-1 text-sm text-neutral-500">
            Save a card during your next payment for faster checkout
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden p-5 rounded-[26px] transition-all duration-300 ${
                card.isDefault
                  ? 'bg-neutral-800 shadow-[0_18px_55px_rgba(0,0,0,0.25)]'
                  : 'bg-neutral-800/60 hover:bg-neutral-800'
              }`}
            >
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`grid place-items-center rounded-xl shrink-0 ${card.isDefault ? 'bg-[#ABFF63]/15' : 'bg-white/5'}`} style={{ width: 44, height: 44 }}>
                    <CreditCard className={`w-5 h-5 ${card.isDefault ? 'text-[#ABFF63]' : 'text-neutral-300'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-grotesque font-bold text-white text-lg">
                        {card.cardType.toUpperCase()} •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="font-manrope flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#ABFF63] text-neutral-900 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="font-manrope text-sm text-neutral-400">
                      <span>Expires {card.expMonth}/{card.expYear}</span>
                      <span className="mx-2 text-neutral-600">•</span>
                      <span>{card.bank}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefaultCard(card.id)}
                      disabled={settingDefaultId === card.id}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold"
                      title="Set as default payment method"
                    >
                      {settingDefaultId === card.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Setting...</span>
                        </>
                      ) : (
                        <>
                          <Star className="w-4 h-4" />
                          <span>Set Default</span>
                        </>
                      )}
                    </button>
                  )}

                  {showChargeButton && chargeAmount && (
                    <button
                      onClick={() => handleChargeCard(card.id)}
                      disabled={chargingCardId === card.id}
                      className="px-4 py-2 bg-[#ABFF63] text-neutral-900 rounded-xl hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                    >
                      {chargingCardId === card.id ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        `Pay R${chargeAmount}`
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingCardId === card.id || card.isDefault}
                    className="p-2.5 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                    title={card.isDefault ? 'Cannot delete default card - set another card as default first' : 'Delete card'}
                  >
                    {deletingCardId === card.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
