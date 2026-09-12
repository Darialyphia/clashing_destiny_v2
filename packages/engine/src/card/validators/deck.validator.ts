import { type Config } from '../../config';
import type { CardBlueprint } from '../card-blueprint';

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

export class DeckValidationRule<TMeta> {
  constructor(
    private options: {
      rule: (deck: ValidatableDeck<TMeta>, validator: DeckValidator<TMeta>) => boolean;
      violation: (
        deck: ValidatableDeck<TMeta>,
        validator: DeckValidator<TMeta>
      ) => DeckViolation;
      predicate?: (
        deck: ValidatableDeck<TMeta>,
        validator: DeckValidator<TMeta>
      ) => boolean;
    }
  ) {}

  validate(
    deck: ValidatableDeck<TMeta>,
    validator: DeckValidator<TMeta>
  ): DeckViolation | null {
    if (this.options.predicate && !this.options.predicate(deck, validator)) {
      return null;
    }
    return this.options.rule(deck, validator)
      ? null
      : this.options.violation(deck, validator);
  }
}

export class CardValidationRule<TMeta> {
  constructor(
    private options: {
      rule: (
        card: ValidatableCard<TMeta>,
        deck: ValidatableDeck<TMeta>,
        validator: DeckValidator<TMeta>
      ) => boolean;
      violation: (
        card: ValidatableCard<TMeta>,
        deck: ValidatableDeck<TMeta>,
        validator: DeckValidator<TMeta>
      ) => DeckViolation;
      predicate?: (
        card: ValidatableCard<TMeta>,
        deck: ValidatableDeck<TMeta>,
        validator: DeckValidator<TMeta>
      ) => boolean;
    }
  ) {}

  validate(
    card: ValidatableCard<TMeta>,
    deck: ValidatableDeck<TMeta>,
    validator: DeckValidator<TMeta>
  ): DeckViolation | null {
    if (this.options.predicate && !this.options.predicate(card, deck, validator)) {
      return null;
    }
    return this.options.rule(card, deck, validator)
      ? null
      : this.options.violation(card, deck, validator);
  }
}

export type DeckValidatorOptions<TMeta> = {
  cardPool: Record<string, CardBlueprint>;
  config: Pick<
    Config,
    | 'MAX_MAIN_DECK_SIZE'
    | 'MAX_DESTINY_CARDS'
    | 'MAX_RUNE_CARDS'
    | 'MAX_MAIN_DECK_CARD_COPIES'
  >;
  deckRules: Array<DeckValidationRule<TMeta>>;
  cardRules: Array<CardValidationRule<TMeta>>;
};
export class DeckValidator<TMeta> implements DeckValidator<TMeta> {
  constructor(private options: DeckValidatorOptions<TMeta>) {}

  get cardPool() {
    return this.options.cardPool;
  }

  get config() {
    return this.options.config;
  }

  get deckRules() {
    return this.options.deckRules;
  }

  get cardRules() {
    return this.options.cardRules;
  }

  get size(): number {
    return this.mainDeckMaxSize + this.destinyDeckMaxSize + this.runeDeckMaxSize;
  }

  get mainDeckMaxSize(): number {
    return this.config.MAX_MAIN_DECK_SIZE;
  }

  get destinyDeckMaxSize(): number {
    return this.config.MAX_DESTINY_CARDS;
  }

  get runeDeckMaxSize(): number {
    return this.config.MAX_RUNE_CARDS;
  }

  getSize(cards: Array<{ copies: number }>) {
    return cards.reduce((acc, card) => acc + card.copies, 0);
  }

  getCards(deck: ValidatableDeck<TMeta>) {
    return deck.cards.map(card => ({
      ...card,
      blueprint: this.cardPool[card.blueprintId] as CardBlueprint
    }));
  }

  private validateCard(
    card: ValidatableCard<TMeta>,
    deck: ValidatableDeck<TMeta>
  ): DeckViolation[] {
    const violations: DeckViolation[] = [];
    for (const rule of this.cardRules) {
      const violation = rule.validate(card, deck, this);
      if (violation) {
        violations.push(violation);
      }
    }
    return violations;
  }

  validate(deck: ValidatableDeck<TMeta>): DeckValidationResult {
    const violations: DeckViolation[] = [];

    for (const rule of this.deckRules) {
      const violation = rule.validate(deck, this);
      if (violation) {
        violations.push(violation);
      }
    }

    for (const card of deck.cards) {
      const cardViolations = this.validateCard(card, deck);
      violations.push(...cardViolations);
    }

    if (violations.length > 0) {
      return { result: 'failure', violations };
    }

    return { result: 'success' };
  }

  canAdd(card: ValidatableCard<TMeta>, deck: ValidatableDeck<TMeta>): boolean {
    const deckCards = this.getCards(deck);

    const cardBlueprint = this.cardPool[card.blueprintId];
    if (!cardBlueprint) return false;

    if (deckCards.length >= this.size) {
      return false;
    }

    const violations = this.validateCard({ ...card, copies: card.copies + 1 }, deck);

    return violations.length === 0;
  }
}
