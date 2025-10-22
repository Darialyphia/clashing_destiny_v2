import type { CardId } from '@game/api';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import {
  CARD_DECK_SOURCES,
  type SpellSchool
} from '@game/engine/src/card/card.enums';
import type {
  DeckValidator,
  ValidatableCard,
  ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { nanoid } from 'nanoid';

export type DeckBuilderCardPool = Array<CardBlueprint>;

type DeckBuilderCardMeta = {
  cardId: CardId;
  isFoil: boolean;
};

export type DeckBuilderDeck = ValidatableDeck<DeckBuilderCardMeta>;
export class DeckBuilderViewModel {
  private _deck: DeckBuilderDeck = {
    id: nanoid(4),
    name: 'New Deck',
    spellSchools: [],
    mainDeck: [],
    destinyDeck: [],
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
      this._deck[CARD_DECK_SOURCES.MAIN_DECK].some(
        card => card.blueprintId === blueprintId
      ) ||
      this._deck[CARD_DECK_SOURCES.DESTINY_DECK].some(
        card => card.blueprintId === blueprintId
      )
    );
  }

  addCard(card: { blueprintId: string; meta: DeckBuilderCardMeta }) {
    const blueprint = this.cardPool.find(c => c.id === card.blueprintId);
    if (!blueprint) {
      throw new Error(
        `Card with ID ${card.blueprintId} not found in card pool.`
      );
    }

    if (blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
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
      this._deck[CARD_DECK_SOURCES.DESTINY_DECK] = this._deck[
        CARD_DECK_SOURCES.DESTINY_DECK
      ].filter(card => card.meta.cardId !== cardId);
    }
  }

  getCard(blueprintId: string) {
    return (
      this._deck[CARD_DECK_SOURCES.MAIN_DECK].find(
        card => card.blueprintId === blueprintId
      ) ||
      this._deck[CARD_DECK_SOURCES.DESTINY_DECK].find(
        card => card.blueprintId === blueprintId
      )
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
        )! as CardBlueprint & {
          deckSource: (typeof CARD_DECK_SOURCES)['MAIN_DECK'];
        };

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
    return this._deck[CARD_DECK_SOURCES.DESTINY_DECK]
      .map(card => {
        const blueprint = this.cardPool.find(
          c => c.id === card.blueprintId
        ) as CardBlueprint & {
          deckSource: (typeof CARD_DECK_SOURCES)['DESTINY_DECK'];
        };

        return {
          ...card,
          blueprint,
          copies: card.copies
        };
      })
      .sort((a, b) => {
        if (a.blueprint.destinyCost === b.blueprint.destinyCost) {
          return a.blueprint.name.localeCompare(b.blueprint.name);
        }
        return a.blueprint.destinyCost - b.blueprint.destinyCost;
      });
  }

  get destinyDeckSize() {
    return this._deck[CARD_DECK_SOURCES.DESTINY_DECK].length;
  }

  get cards() {
    return [
      ...this._deck[CARD_DECK_SOURCES.MAIN_DECK],
      ...this._deck[CARD_DECK_SOURCES.DESTINY_DECK]
    ]
      .map(card => {
        const blueprint = this.cardPool.find(c => c.id === card.blueprintId)!;

        return {
          ...card,
          blueprint
        };
      })
      .toSorted((a, b) => {
        if (
          a.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          b.blueprint.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK
        ) {
          return -1;
        }

        if (
          a.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          b.blueprint.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK
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
          a.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          b.blueprint.deckSource === CARD_DECK_SOURCES.DESTINY_DECK
        ) {
          if (a.blueprint.destinyCost === b.blueprint.destinyCost) {
            return a.blueprint.name.localeCompare(b.blueprint.name);
          }
          return a.blueprint.destinyCost - b.blueprint.destinyCost;
        }

        return 0;
      });
  }

  toggleSpellSchool(school: SpellSchool) {
    if (this._deck.spellSchools.includes(school)) {
      this._deck.spellSchools = this._deck.spellSchools.filter(
        s => s !== school
      );
    } else if (this._deck.spellSchools.length < 2) {
      this._deck.spellSchools.push(school);
    }
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
      spellSchools: []
    };
  }
}
