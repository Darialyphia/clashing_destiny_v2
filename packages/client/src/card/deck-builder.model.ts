import type { CardId } from '@game/api';
import type {
  ArtifactBlueprint,
  CardBlueprint,
  MinionBlueprint,
  SpellBlueprint
} from '@game/engine/src/card/card-blueprint';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
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
    mainDeck: Array<{ blueprintId: string; copies: number }>;
    destinyDeck: Array<{ blueprintId: string; copies: number }>;
  } {
    try {
      const decoded = atob(deckCode);
      const [name, mainEncoded, destinyEncoded] = decoded.split('~');

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
        mainDeck: decodeDeckList(mainEncoded),
        destinyDeck: decodeDeckList(destinyEncoded)
      };
    } catch (error) {
      console.error('Failed to decode deck code:', error);
      throw new Error('Invalid deck code format');
    }
  }

  private _deck: DeckBuilderDeck = {
    id: nanoid(4),
    name: 'New Deck',
    mainDeck: [],
    destinyDeck: [],
    hero: null,
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
    return (
      this._deck.mainDeck.some(card => card.blueprintId === blueprintId) ||
      this._deck.destinyDeck.some(card => card.blueprintId === blueprintId)
    );
  }

  addCard(card: { blueprintId: string; meta: DeckBuilderCardMeta }) {
    const blueprint = this.cardPool.find(c => c.id === card.blueprintId);
    if (!blueprint) {
      throw new Error(
        `Card with ID ${card.blueprintId} not found in card pool.`
      );
    }

    if (blueprint.kind === CARD_KINDS.HERO) {
      this._deck.hero = {
        blueprintId: card.blueprintId,
        copies: 1,
        meta: card.meta
      };
      return;
    } else if (blueprint.kind === CARD_KINDS.DESTINY) {
      const existing = this._deck.destinyDeck.find(
        c => c.meta.cardId === card.meta.cardId
      );

      if (existing) {
        existing.copies++;
      } else {
        this._deck.destinyDeck.push({
          blueprintId: card.blueprintId,
          copies: 1,
          meta: card.meta
        });
      }

      return;
    }

    const existing = this._deck.mainDeck.find(
      c => c.meta.cardId === card.meta.cardId
    );
    if (existing) {
      existing.copies++;
    } else {
      this._deck.mainDeck.push({
        blueprintId: card.blueprintId,
        copies: 1,
        meta: card.meta
      });
    }
  }

  removeCard(cardId: string) {
    if (this._deck.hero?.meta.cardId === cardId) {
      this._deck.hero = null;
      return;
    }

    const isMainDeck = this._deck.mainDeck.find(
      card => card.meta.cardId === cardId
    );
    if (isMainDeck) {
      isMainDeck.copies--;
      if (isMainDeck.copies <= 0) {
        this._deck.mainDeck = this._deck.mainDeck.filter(
          card => card.meta.cardId !== cardId
        );
      }
    } else {
      this._deck.destinyDeck = this._deck.destinyDeck.filter(
        card => card.meta.cardId !== cardId
      );
    }
  }

  getCard(blueprintId: string) {
    return (
      this._deck.mainDeck.find(card => card.blueprintId === blueprintId) ||
      this._deck.destinyDeck.find(card => card.blueprintId === blueprintId)
    );
  }

  get validator() {
    return this._validator;
  }

  get deck() {
    return this._deck;
  }

  get mainDeckSize() {
    return this._deck.mainDeck.reduce((acc, card) => acc + card.copies, 0);
  }

  get mainDeckCards() {
    return this._deck.mainDeck
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.id === card.blueprintId
        )! as ArtifactBlueprint | SpellBlueprint | MinionBlueprint;

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .sort((a, b) => {
        if (a.blueprint.manaCost === b.blueprint.manaCost) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }
        return a.blueprint.manaCost - b.blueprint.manaCost;
      });
  }

  get destinyDeckCards() {
    return this._deck.destinyDeck
      .map(card => {
        const blueprint = this.cardPool.find(c => c.id === card.blueprintId)!;

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .sort((a, b) => {
        return a.blueprint.name.localeCompare(b.blueprint.name);
      });
  }

  get deckCode() {
    // Optimized deck code format:
    // Group cards by copy count for better compression
    // Format: name|{copies}:{card,card}|{copies}:{card}|...

    const encodeDeckList = (cards: typeof this._deck.mainDeck) => {
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

    const mainEncoded = encodeDeckList(this._deck.mainDeck);
    const runeEncoded = encodeDeckList(this._deck.destinyDeck);
    const heroEncoded = this._deck.hero
      ? encodeDeckList([
          {
            blueprintId: this._deck.hero.blueprintId,
            copies: 1,
            meta: this._deck.hero.meta
          }
        ])
      : '';

    const deckString = `${this._deck.name}~${mainEncoded}~${runeEncoded}~${heroEncoded}`;

    return btoa(deckString);
  }

  get destinyDeckSize() {
    return this._deck.destinyDeck.length;
  }

  get cards() {
    return [...this._deck.mainDeck, ...this._deck.destinyDeck]
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
      mainDeck: [],
      destinyDeck: [],
      hero: null
    };
  }
}
