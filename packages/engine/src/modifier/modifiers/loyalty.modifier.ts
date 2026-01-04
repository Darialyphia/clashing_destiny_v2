import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class LoyaltyModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    {
      mixins,
      hpAmount,
      manaAmount,
      destinyAmount
    }: {
      mixins?: ModifierMixin<T>[];
      hpAmount?: number;
      manaAmount?: number;
      destinyAmount?: number;
    }
  ) {
    super(KEYWORDS.OVERWHELM.id, game, source, {
      name: KEYWORDS.OVERWHELM.name,
      description: KEYWORDS.OVERWHELM.description,
      icon: 'keyword-overwhelm',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LOYALTY),
        new CardInterceptorModifierMixin(game, {
          key: 'loyaltyHpCost',
          interceptor: value => value + (hpAmount ?? 0)
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'loyaltyManaCostIncrease',
          interceptor: value => value + (manaAmount ?? 0)
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'loyaltyDestinyCostIncrease',
          interceptor: value => value + (destinyAmount ?? 0)
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
