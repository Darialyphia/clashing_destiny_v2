import { defaultConfig } from '../../config';
import { CARD_KINDS, type CardKind } from '../card.enums';
import {
  CardValidationRule,
  DeckValidationRule,
  DeckValidator,
  type DeckValidatorOptions
} from './deck.validator';

class InvalidDeckSizeRule<TMeta> extends DeckValidationRule<TMeta> {
  constructor() {
    super({
      rule: (deck, validator) => {
        return validator.getSize(deck.cards) === validator.size;
      },
      violation: (deck, validator) => ({
        type: 'invalid_deck_size',
        reason: `Deck must have exactly ${validator.size} cards.`
      })
    });
  }
}

class InvalidCardcountForKindRule<TMeta> extends DeckValidationRule<TMeta> {
  constructor(kind: CardKind, minCount: number, maxCount: number) {
    super({
      rule: (deck, validator) => {
        const count = deck.cards.reduce((acc, card) => {
          const blueprint = validator.cardPool[card.blueprintId];
          if (blueprint?.kind === kind) {
            return acc + card.copies;
          }
          return acc;
        }, 0);
        return count >= minCount && count <= maxCount;
      },
      violation: () => ({
        type: 'invalid_cardcount_for_kind',
        reason:
          minCount === maxCount
            ? `Deck must include exactly ${minCount} ${kind} cards.`
            : `Deck must include between ${minCount} and ${maxCount} ${kind} cards.`
      })
    });
  }
}

class UnknownCardRule<TMeta> extends CardValidationRule<TMeta> {
  constructor() {
    super({
      rule: (card, deck, validator) => {
        return !!validator.cardPool[card.blueprintId];
      },
      violation: () => ({
        type: 'unknown_card',
        reason: 'Card not found in allowed card pool.'
      })
    });
  }
}

class TooManyCopiesRule<TMeta> extends CardValidationRule<TMeta> {
  constructor(allowedCopies: Record<CardKind, number>) {
    super({
      rule: (card, deck, validator) => {
        const blueprint = validator.cardPool[card.blueprintId];
        if (!blueprint) return true;

        // factor in all copies across multiple cards (eg. foil and nonfoil versions)
        const totalCopies = validator
          .getCards(deck)
          .filter(c => c.blueprintId === card.blueprintId)
          .reduce((acc, c) => acc + c.copies, 0);
        return totalCopies < allowedCopies[blueprint.kind];
      },
      violation: (card, deck, validator) => ({
        type: 'too_many_copies',
        reason: `Card ${validator.cardPool[card.blueprintId]?.name} has too many copies.`
      })
    });
  }
}
export class StandardDeckValidator<TMeta> extends DeckValidator<TMeta> {
  constructor(options: Pick<DeckValidatorOptions<TMeta>, 'cardPool'>) {
    super({
      ...options,
      config: defaultConfig,
      deckRules: [
        new InvalidDeckSizeRule(),
        new InvalidCardcountForKindRule(
          CARD_KINDS.DESTINY,
          defaultConfig.MAX_DESTINY_CARDS,
          defaultConfig.MAX_DESTINY_CARDS
        ),
        new InvalidCardcountForKindRule(
          CARD_KINDS.RUNE,
          defaultConfig.MAX_RUNE_CARDS,
          defaultConfig.MAX_RUNE_CARDS
        )
      ],
      cardRules: [
        new UnknownCardRule(),
        new TooManyCopiesRule({
          ARTIFACT: defaultConfig.MAX_MAIN_DECK_CARD_COPIES,
          MINION: defaultConfig.MAX_MAIN_DECK_CARD_COPIES,
          SPELL: defaultConfig.MAX_MAIN_DECK_CARD_COPIES,
          DESTINY: 1,
          RUNE: defaultConfig.MAX_RUNE_CARDS,
          SECRET: defaultConfig.MAX_MAIN_DECK_CARD_COPIES
        })
      ]
    });
  }
}
