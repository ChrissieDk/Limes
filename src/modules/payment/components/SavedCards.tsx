import { useEffect, useState } from 'react'
import { CreditCard, Trash2, Loader2, AlertCircle, CheckCircle2, Star, FileText } from 'lucide-react'
import { paymentService } from '../services/paymentService'
import { toCents } from '../utils/dynamicPricing'
import type { SavedCard } from '../../../types/payment'

interface SavedCardsProps {
  onCardSelected?: (cardId: string) => void
  showChargeButton?: boolean
  chargeAmount?: number
}

export default function SavedCards({ 
  onCardSelected, 
  showChargeButton = false,
  chargeAmount 
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
      // Deduplicate cards based on last4, expMonth, expYear, and bank
      const uniqueCards = deduplicateCards(data)
      setCards(uniqueCards)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load saved cards')
    } finally {
      setLoading(false)
    }
  }

  // Deduplicate cards - keep the one that's marked as default, or the most recent one
  const deduplicateCards = (cardList: SavedCard[]): SavedCard[] => {
    const cardMap = new Map<string, SavedCard>()
    
    cardList.forEach((card) => {
      // Create a unique key based on card details
      const key = `${card.last4}-${card.expMonth}-${card.expYear}-${card.bank}`
      
      const existing = cardMap.get(key)
      
      // Keep the card if:
      // 1. No existing card with this key
      // 2. This card is default and existing is not
      // 3. This card has a more recent ID (assuming newer cards have higher IDs)
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
      // Update local state
      setCards(cards.map(c => ({
        ...c,
        isDefault: c.id === cardId
      })))
      setSuccessMessage('Default card updated successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to set default card')
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
      setCards(cards.filter(c => c.id !== cardId))
      setSuccessMessage('Card deleted successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete card')
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
        amount: toCents(chargeAmount),  // Convert rands to cents for API
      })

      if (response.success) {
        setSuccessMessage(`Payment of R${chargeAmount} successful!`)
        setTimeout(() => setSuccessMessage(null), 3000)
        if (onCardSelected) {
          onCardSelected(cardId)
        }
      } else {
        setError(response.error || 'Payment failed')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to charge card')
    } finally {
      setChargingCardId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
        <span className="ml-3 text-gray-400">Loading saved cards...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-900/40 to-green-800/20 border border-green-700/50 rounded-xl text-green-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Cards List */}
      {cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-transparent px-6 py-14 text-center">
          <FileText className="w-7 h-7 text-white/80 mx-auto mb-4" />
          <div className="text-white font-semibold">No saved cards</div>
          <div className="mt-1 text-sm text-neutral-500">
            Save a card during your next payment for faster checkout
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`group relative overflow-hidden p-5 rounded-xl transition-all duration-300 ${
                card.isDefault
                  ? 'bg-white/5 ring-2 ring-[#ABFF63]/40 shadow-[0_18px_55px_rgba(0,0,0,0.25)]'
                  : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'
              }`}
            >
              {/* Subtle background gradient effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-400/5 to-transparent rounded-full blur-2xl" />
              
              <div className="relative flex items-center justify-between">
                {/* Card Info */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${card.isDefault ? 'bg-[#ABFF63]/15' : 'bg-white/5'} transition-colors ring-1 ring-white/10`}>
                    <CreditCard className={`w-6 h-6 ${card.isDefault ? 'text-[#ABFF63]' : 'text-neutral-300'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-lg">
                        {card.cardType.toUpperCase()} •••• {card.last4}
                      </span>
                      {card.isDefault && (
                        <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#ABFF63] text-neutral-900 rounded-full">
                          <Star className="w-3 h-3 fill-current" />
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="font-medium">Expires {card.expMonth}/{card.expYear}</span>
                      <span className="mx-2">•</span>
                      <span>{card.bank}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Set as Default Button */}
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefaultCard(card.id)}
                      disabled={settingDefaultId === card.id}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 ring-1 ring-white/10 text-white rounded-xl hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-semibold"
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

                  {/* Charge Button */}
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

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    disabled={deletingCardId === card.id || card.isDefault}
                    className="p-2.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title={card.isDefault ? "Cannot delete default card - set another card as default first" : "Delete card"}
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
