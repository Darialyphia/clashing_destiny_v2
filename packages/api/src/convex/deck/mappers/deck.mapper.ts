import type { BetterOmit } from '@game/shared';
import type { Deck, DeckDoc } from '../entities/deck.entity';

export class DeckMapper {
  static INJECTION_KEY = 'deckMapper' as const;

  toPersistence(deck: Deck): BetterOmit<DeckDoc, '_creationTime'> {
    return {
      _id: deck.id,
      name: deck.name,
      ownerId: deck.ownerId,
      cards: deck.cards
    };
  }
}
