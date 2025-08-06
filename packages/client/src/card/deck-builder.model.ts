import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS
} from '@game/engine/src/card/card.enums';
import type {
  DeckValidator,
  ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { nanoid } from 'nanoid';

export type DeckBuilderCardPool = Array<{
  blueprint: CardBlueprint;
  copiesOwned: number;
}>;

export class DeckBuilderViewModel {
  private _deck: ValidatableDeck = {
    id: nanoid(4),
    name: 'New Deck',
    [CARD_DECK_SOURCES.MAIN_DECK]: [],
    [CARD_DECK_SOURCES.DESTINY_DECK]: [],
    hero: null as unknown as string // will be filled later
  };

  constructor(
    private cardPool: DeckBuilderCardPool,
    private _validator: DeckValidator
  ) {
    this.cardPool = cardPool;
  }

  hasCard(blueprintId: string) {
    return (
      this._deck[CARD_DECK_SOURCES.MAIN_DECK].some(
        card => card.blueprintId === blueprintId
      ) ||
      this._deck[CARD_DECK_SOURCES.DESTINY_DECK].some(
        card => card.blueprintId === blueprintId
      ) ||
      this._deck.hero === blueprintId
    );
  }

  addCard(blueprintId: string) {
    const card = this.cardPool.find(card => card.blueprint.id === blueprintId);
    if (!card) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }

    if (card.blueprint.kind === CARD_KINDS.HERO) {
      this._deck.hero = blueprintId;
      return;
    }

    if (card.blueprint.kind === CARD_KINDS.DESTINY) {
      const existing = this._deck[CARD_DECK_SOURCES.DESTINY_DECK].find(
        card => card.blueprintId === blueprintId
      );
      if (existing) return;

      this._deck[CARD_DECK_SOURCES.DESTINY_DECK].push({
        blueprintId
      });
      return;
    }

    const existing = this._deck.mainDeck.find(
      card => card.blueprintId === blueprintId
    );
    if (existing) {
      existing.copies++;
    } else {
      this._deck.mainDeck.push({ blueprintId, copies: 1 });
    }
  }

  removeCard(blueprintId: string) {
    const card = this.cardPool.find(card => card.blueprint.id === blueprintId);
    if (!card) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }

    if (card.blueprint.kind === CARD_KINDS.HERO) {
      this._deck.hero = null as any;
      return;
    }

    const isMainDeck = this._deck.mainDeck.find(
      card => card.blueprintId === blueprintId
    );
    if (isMainDeck) {
      isMainDeck.copies--;
      if (isMainDeck.copies <= 0) {
        this._deck.mainDeck = this._deck.mainDeck.filter(
          card => card.blueprintId !== blueprintId
        );
      }
    }
    this._deck[CARD_DECK_SOURCES.DESTINY_DECK] = this._deck[
      CARD_DECK_SOURCES.DESTINY_DECK
    ].filter(card => card.blueprintId !== blueprintId);
  }

  get validator() {
    return this._validator;
  }

  get hero() {
    return this._deck.hero
      ? this.cardPool.find(card => card.blueprint.id === this._deck.hero)
      : null;
  }

  get deck() {
    return this._deck;
  }

  get mainDeckSize() {
    return this._deck[CARD_DECK_SOURCES.MAIN_DECK].reduce(
      (acc, card) => acc + card.copies,
      0
    );
  }

  get mainDeckCards() {
    return this._deck[CARD_DECK_SOURCES.MAIN_DECK].map(card => {
      const blueprint = this.cardPool.find(
        c => c.blueprint.id === card.blueprintId
      )!.blueprint as CardBlueprint;

      return {
        ...card,
        blueprint
      };
    });
  }

  get cards() {
    return [
      ...this._deck[CARD_DECK_SOURCES.MAIN_DECK],
      ...this._deck[CARD_DECK_SOURCES.DESTINY_DECK]
    ]
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.blueprint.id === card.blueprintId
        )!.blueprint as CardBlueprint;

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
          a.blueprint.kind !== CARD_KINDS.DESTINY &&
          b.blueprint.kind === CARD_KINDS.DESTINY
        ) {
          return 1;
        }

        if (
          a.blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
          b.blueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK
        ) {
          if (a.blueprint.manaCost === b.blueprint.manaCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.blueprint.manaCost - b.blueprint.manaCost;
        }

        if (
          a.blueprint.kind === CARD_KINDS.DESTINY &&
          b.blueprint.kind === CARD_KINDS.DESTINY
        ) {
          if (a.blueprint.destinyCost === b.blueprint.destinyCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.blueprint.destinyCost - b.blueprint.destinyCost;
        }

        return 0;
      });
  }

  getErrors() {
    return this._validator.validate(this._deck);
  }

  loadDeck(deck: ValidatableDeck) {
    this._deck = deck;
  }

  canAdd(blueprintId: string) {
    const card = this.cardPool.find(card => card.blueprint.id === blueprintId);
    if (!card) {
      throw new Error(`Card with ID ${blueprintId} not found in card pool.`);
    }
    return this._validator.canAdd(card.blueprint, this._deck);
  }

  reset() {
    this._deck = {
      id: nanoid(4),
      name: 'New Deck',
      [CARD_DECK_SOURCES.MAIN_DECK]: [],
      [CARD_DECK_SOURCES.DESTINY_DECK]: [],
      hero: null as any
    };
  }
}
