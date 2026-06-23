/**
 * Card utility functions shared across payment components.
 */

import type { SavedCard } from '../../../types/payment'

/**
 * Deduplicate saved cards by their last4-expMonth-expYear-bank combination.
 * When duplicates exist, prefers the default card, then the most recent (higher id).
 */
export function deduplicateCards(cardList: SavedCard[]): SavedCard[] {
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
