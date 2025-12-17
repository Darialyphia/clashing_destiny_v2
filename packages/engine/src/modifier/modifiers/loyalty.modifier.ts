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
    { mixins, amount }: { mixins?: ModifierMixin<T>[]; amount: number }
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
          interceptor: value => value + amount
        }),
        ...(mixins ?? [])
      ]
    });
  }
}
