import { defaultConfig } from '../../config';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_DECK_SOURCES, type CardDeckSource, type SpellSchool } from '../card.enums';

export type DeckViolation = {
  type: string;
  reason: string;
};

export type ValidatableCard<TMeta> = {
  blueprintId: string;
  copies: number;
  meta: TMeta;
};
export type ValidatableDeck<TMeta> = {
  id: string;
  name: string;
  isEqual(first: ValidatableCard<TMeta>, second: ValidatableCard<TMeta>): boolean;
  spellSchools: SpellSchool[];
  mainDeck: Array<ValidatableCard<TMeta>>;
  destinyDeck: Array<ValidatableCard<TMeta>>;
};

export type DeckValidationResult =
  | {
      result: 'success';
    }
  | { result: 'failure'; violations: Array<DeckViolation> };

export type DeckValidator<TMeta> = {
  maxCopiesForMainDeckCard: number;
  maxCopiesForDestinyCard: number;
  mainDeckSize: number;
  destinyDeckSize: number;
  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult;
  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean;
};

export class StandardDeckValidator<TMeta> implements DeckValidator<TMeta> {
  constructor(private cardPool: Record<string, CardBlueprint>) {}

  get mainDeckSize(): number {
    return defaultConfig.MAX_MAIN_DECK_SIZE;
  }

  get destinyDeckSize(): number {
    return defaultConfig.MAX_DESTINY_DECK_SIZE;
  }

  get maxCopiesForMainDeckCard(): number {
    return defaultConfig.MAX_MAIN_DECK_CARD_COPIES;
  }

  get maxCopiesForDestinyCard(): number {
    return defaultConfig.MAX_DESTINY_DECK_CARD_COPIES;
  }

  private validateCard(
    card: {
      blueprint: CardBlueprint;
      copies: number;
    },
    source: CardDeckSource
  ): DeckViolation[] {
    const violations: DeckViolation[] = [];
    if (card.blueprint.deckSource !== source) {
      violations.push({
        type: 'invalid_card_source',
        reason: `Card ${card.blueprint.name} is not allowed in ${source}.`
      });
    }

    if (card.blueprint.unique && card.copies > 1) {
      violations.push({
        type: 'too_many_copies_unique',
        reason: `Card ${card.blueprint.name} is unique and cannot be included more than once.`
      });
    }

    if (card.copies > defaultConfig.MAX_MAIN_DECK_CARD_COPIES) {
      violations.push({
        type: 'too_many_copies',
        reason: `Card ${card.blueprint.name} has too many copies.`
      });
    }

    return violations;
  }

  private getSize(cards: Array<{ copies: number }>) {
    return cards.reduce((acc, card) => acc + card.copies, 0);
  }

  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult {
    const violations: DeckViolation[] = [];

    if (
      this.getSize(deck[CARD_DECK_SOURCES.MAIN_DECK]) !== defaultConfig.MAX_MAIN_DECK_SIZE
    ) {
      violations.push({
        type: 'invalid_deck_size',
        reason: `Main deck must have exactly ${defaultConfig.MAX_MAIN_DECK_SIZE} cards.`
      });
    }

    for (const card of deck[CARD_DECK_SOURCES.MAIN_DECK]) {
      const blueprint = this.cardPool[card.blueprintId];
      if (!blueprint) {
        violations.push({
          type: 'unknown_card',
          reason: `Card with Id ${card.blueprintId} not found in card pool.`
        });
      }

      violations.push(
        ...this.validateCard(
          {
            blueprint,
            copies: card.copies
          },
          CARD_DECK_SOURCES.MAIN_DECK
        )
      );
    }

    return { result: 'success' };
  }

  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean {
    const withBlueprint = {
      main: deck[CARD_DECK_SOURCES.MAIN_DECK].map(card => ({
        ...card,
        blueprint: this.cardPool[card.blueprintId] as CardBlueprint & {
          decksource: typeof CARD_DECK_SOURCES.MAIN_DECK;
        }
      })),
      destiny: deck[CARD_DECK_SOURCES.DESTINY_DECK].map(card => ({
        ...card,
        blueprint: this.cardPool[card.blueprintId] as CardBlueprint & {
          decksource: typeof CARD_DECK_SOURCES.DESTINY_DECK;
        }
      }))
    };

    const cardBlueprint = this.cardPool[card.blueprintId];
    if (!cardBlueprint) return false;

    if (cardBlueprint.deckSource === CARD_DECK_SOURCES.MAIN_DECK) {
      if (withBlueprint.main.length >= this.mainDeckSize) {
        return false;
      }
      const existing = withBlueprint.main.find(c => deck.isEqual(c, card));
      if (existing) {
        if (existing.copies >= this.maxCopiesForMainDeckCard) {
          return false;
        }
        if (cardBlueprint.unique) {
          return false;
        }
      }

      return true;
    } else {
      if (withBlueprint.destiny.length >= this.destinyDeckSize) {
        return false;
      }
      const existing = withBlueprint.destiny.find(c => deck.isEqual(c, card));
      if (existing) {
        if (existing.copies >= this.maxCopiesForDestinyCard) {
          return false;
        }
        if (cardBlueprint.unique) {
          return false;
        }
      }

      return true;
    }
  }
}
