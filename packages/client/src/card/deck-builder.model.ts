import type { CardId } from '@game/api';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  MinionBlueprint,
  SpellBlueprint
} from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import type {
  DeckValidator,
  ValidatableCard,
  ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import {
  cardShortIds,
  cardIdByShortId
} from '@game/engine/src/generated/cards';
import { nanoid } from 'nanoid';

export type DeckBuilderCardPool = Array<CardBlueprint>;

type DeckBuilderCardMeta = {
  cardId: CardId;
  isFoil: boolean;
};

export type DeckBuilderDeck = ValidatableDeck<DeckBuilderCardMeta>;
export class DeckBuilderViewModel {
  /**
   * Decode a deck code string into deck data
   * Format: base64(name~copies:card.card|copies:card~copies:card.card)
   */
  static decodeDeckCode(deckCode: string): {
    name: string;
    cards: Array<{ blueprintId: string; copies: number }>;
  } {
    try {
      const decoded = atob(deckCode);
      const [name, mainEncoded] = decoded.split('~');

      const decodeDeckList = (encoded: string) => {
        if (!encoded) return [];

        const cards: Array<{ blueprintId: string; copies: number }> = [];
        const groups = encoded.split('|');

        for (const group of groups) {
          const [copiesStr, cardsStr] = group.split(':');
          const copies = parseInt(copiesStr, 10);
          const shortIds = cardsStr.split('.').map(id => parseInt(id, 10));

          for (const shortId of shortIds) {
            const blueprintId = cardIdByShortId[shortId];
            if (blueprintId) {
              cards.push({ blueprintId, copies });
            }
          }
        }

        return cards;
      };

      return {
        name: name || 'Imported Deck',
        cards: decodeDeckList(mainEncoded)
      };
    } catch (error) {
      console.error('Failed to decode deck code:', error);
      throw new Error('Invalid deck code format');
    }
  }

  private _deck: DeckBuilderDeck = {
    id: nanoid(4),
    name: 'New Deck',
    cards: [],
    isEqual: (first, second) => first.meta.cardId === second.meta.cardId
  };

  constructor(
    private cardPool: DeckBuilderCardPool,
    private _validator: DeckValidator<DeckBuilderCardMeta>
  ) {
    this.cardPool = cardPool;
  }

  updateCardPool(cardPool: DeckBuilderCardPool) {
    this.cardPool = cardPool;
  }

  hasCard(blueprintId: string) {
    return this._deck.cards.some(card => card.blueprintId === blueprintId);
  }

  addCard(card: { blueprintId: string; meta: DeckBuilderCardMeta }) {
    const blueprint = this.cardPool.find(c => c.id === card.blueprintId);
    if (!blueprint) {
      throw new Error(
        `Card with ID ${card.blueprintId} not found in card pool.`
      );
    }

    const existing = this._deck.cards.find(
      c => c.meta.cardId === card.meta.cardId
    );
    if (existing) {
      existing.copies++;
    } else {
      this._deck.cards.push({
        blueprintId: card.blueprintId,
        copies: 1,
        meta: card.meta
      });
    }
  }

  removeCard(cardId: string) {
    const found = this._deck.cards.find(card => card.meta.cardId === cardId);
    if (found) {
      found.copies--;
      if (found.copies <= 0) {
        this._deck.cards = this._deck.cards.filter(
          card => card.meta.cardId !== cardId
        );
      }
    }
  }

  getCard(blueprintId: string) {
    return this._deck.cards.find(card => card.blueprintId === blueprintId);
  }

  get validator() {
    return this._validator;
  }

  get deck() {
    return this._deck;
  }

  get size() {
    return this._deck.cards.reduce((acc, card) => acc + card.copies, 0);
  }

  get mainDeckCards() {
    return this._deck.cards
      .map(card => {
        const blueprint = this.cardPool.find(c => c.id === card.blueprintId)!;

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .filter(card => card.blueprint.kind !== CARD_KINDS.DESTINY)
      .sort((a, b) => {
        if (
          a.blueprint.kind === CARD_KINDS.HERO &&
          b.blueprint.kind !== CARD_KINDS.HERO
        ) {
          return -1;
        }

        if (
          a.blueprint.kind !== CARD_KINDS.HERO &&
          b.blueprint.kind === CARD_KINDS.HERO
        ) {
          return 1;
        }

        if (
          a.blueprint.kind === CARD_KINDS.HERO &&
          b.blueprint.kind === CARD_KINDS.HERO
        ) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }

        // @ts-expect-error - We know these are the only possible types at this point
        if (a.blueprint.manaCost === b.blueprint.manaCost) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }
        // @ts-expect-error - We know these are the only possible types at this point
        return a.blueprint.manaCost - b.blueprint.manaCost;
      });
  }

  get destinyDeckCards() {
    return this._deck.cards
      .map(card => {
        const blueprint = this.cardPool.find(c => c.id === card.blueprintId)!;

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .filter(card => card.blueprint.kind === CARD_KINDS.DESTINY)
      .sort((a, b) => {
        return a.blueprint.name.localeCompare(b.blueprint.name);
      });
  }

  get deckCode() {
    // Optimized deck code format:
    // Group cards by copy count for better compression
    // Format: name|{copies}:{card,card}|{copies}:{card}|...

    const encodeDeckList = (cards: typeof this._deck.cards) => {
      // Group by copy count
      const grouped = new Map<number, number[]>();
      for (const card of cards) {
        const shortId = cardShortIds[card.blueprintId];
        const existing = grouped.get(card.copies) || [];
        existing.push(shortId);
        grouped.set(card.copies, existing);
      }

      // Format: copies:card,card,card
      return Array.from(grouped.entries())
        .map(([copies, cardIds]) => `${copies}:${cardIds.join('.')}`)
        .join('|');
    };

    const mainEncoded = encodeDeckList(this._deck.cards);

    const deckString = `${this._deck.name}~${mainEncoded}`;

    return btoa(deckString);
  }

  get mainDeckSize() {
    return this._deck.cards
      .filter(
        card => CARDS_DICTIONARY[card.blueprintId].kind !== CARD_KINDS.DESTINY
      )
      .reduce((acc, card) => acc + card.copies, 0);
  }

  get destinyDeckSize() {
    return this._deck.cards
      .filter(
        card => CARDS_DICTIONARY[card.blueprintId].kind === CARD_KINDS.DESTINY
      )
      .reduce((acc, card) => acc + card.copies, 0);
  }

  get cards() {
    return [...this._deck.cards]
      .map(card => {
        const blueprint = this.cardPool.find(c => c.id === card.blueprintId)!;

        return {
          ...card,
          blueprint
        };
      })
      .toSorted((a, b) => {
        if (
          a.blueprint.kind === CARD_KINDS.DESTINY &&
          b.blueprint.kind !== CARD_KINDS.DESTINY
        ) {
          return -1;
        }

        if (
          a.blueprint.kind === CARD_KINDS.DESTINY &&
          b.blueprint.kind !== CARD_KINDS.DESTINY
        ) {
          return 1;
        }

        const aBp = a.blueprint as
          | ArtifactBlueprint
          | SpellBlueprint
          | MinionBlueprint;
        const bBp = b.blueprint as
          | ArtifactBlueprint
          | SpellBlueprint
          | MinionBlueprint;
        if (aBp.manaCost === bBp.manaCost) {
          return aBp.name.localeCompare(bBp.name);
        }
        return aBp.manaCost - bBp.manaCost;
      });
  }

  getErrors() {
    return this._validator.validate(this._deck);
  }

  loadDeck(deck: ValidatableDeck<DeckBuilderCardMeta>) {
    this._deck = deck;
  }

  canAdd(card: ValidatableCard<DeckBuilderCardMeta>) {
    return this._validator.canAdd(card, this._deck);
  }

  reset() {
    this._deck = {
      id: nanoid(4),
      name: 'New Deck',
      isEqual: (first, second) => first.meta.cardId === second.meta.cardId,
      cards: []
    };
  }
}
