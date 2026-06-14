import { defaultConfig } from '../../config';
import type { CardBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';

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
  cards: Array<ValidatableCard<TMeta>>;
};

export type DeckValidationResult =
  | {
      result: 'success';
    }
  | { result: 'failure'; violations: Array<DeckViolation> };

export type DeckValidator<TMeta> = {
  getMaxCopies: (card: ValidatableCard<TMeta>) => number;
  size: number;
  mainDeckMaxSize: number;
  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult;
  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean;
};

export class StandardDeckValidator<TMeta> implements DeckValidator<TMeta> {
  constructor(private cardPool: Record<string, CardBlueprint>) {}

  get size(): number {
    return (
      defaultConfig.MAX_MAIN_DECK_SIZE +
      defaultConfig.MAX_HERO_CARDS +
      defaultConfig.MAX_DESTINY_CARDS
    );
  }

  get mainDeckMaxSize(): number {
    return defaultConfig.MAX_MAIN_DECK_SIZE;
  }

  get destinyDeckSize(): number {
    return defaultConfig.MAX_DESTINY_CARDS;
  }

  getMaxCopies(card: ValidatableCard<TMeta>): number {
    const blueprint = this.cardPool[card.blueprintId] as CardBlueprint;
    if (blueprint.kind === CARD_KINDS.HERO || blueprint.kind === CARD_KINDS.DESTINY) {
      return 1;
    }
    return defaultConfig.MAX_MAIN_DECK_CARD_COPIES;
  }

  private validateCard(card: {
    blueprint: CardBlueprint;
    copies: number;
  }): DeckViolation[] {
    const violations: DeckViolation[] = [];

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

    if (this.getSize(deck.cards) !== this.size) {
      violations.push({
        type: 'invalid_deck_size',
        reason: `Deck must have exactly ${this.size} cards.`
      });
    }
    let hasHero = false;
    let destinyCount = 0;
    for (const card of deck.cards) {
      const blueprint = this.cardPool[card.blueprintId];
      if (!blueprint) {
        violations.push({
          type: 'unknown_card',
          reason: `Card with Id ${card.blueprintId} not found in card pool.`
        });
      }
      if (blueprint?.kind === CARD_KINDS.HERO) {
        hasHero = true;
      }
      if (blueprint?.kind === CARD_KINDS.DESTINY) {
        destinyCount++;
      }

      if (!hasHero) {
        violations.push({
          type: 'missing_hero',
          reason: 'Deck must include a hero card.'
        });
      }

      if (destinyCount > this.destinyDeckSize) {
        violations.push({
          type: 'too_many_destiny_cards',
          reason: `Deck can only include ${this.destinyDeckSize} destiny cards.`
        });
      }

      if (hasHero && destinyCount < this.destinyDeckSize) {
        violations.push({
          type: 'too_few_destiny_cards',
          reason: `Deck must include ${this.destinyDeckSize} destiny cards.`
        });
      }

      violations.push(
        ...this.validateCard({
          blueprint,
          copies: card.copies
        })
      );
    }
    if (violations.length > 0) {
      return { result: 'failure', violations };
    }

    return { result: 'success' };
  }

  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean {
    const withBlueprint = deck.cards.map(card => ({
      ...card,
      blueprint: this.cardPool[card.blueprintId] as CardBlueprint
    }));

    const cardBlueprint = this.cardPool[card.blueprintId];
    if (!cardBlueprint) return false;

    if (withBlueprint.length >= this.size) {
      return false;
    }

    const existing = withBlueprint.find(c => deck.isEqual(c, card));
    if (existing && existing.copies >= this.getMaxCopies(card)) {
      return false;
    }

    return true;
  }
}
