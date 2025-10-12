import { isDefined } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';
import { KEYWORDS } from '../../card/card-keywords';

export class EfficiencyModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.EFFICIENCY.id, game, source, {
      isUnique: true,
      name: KEYWORDS.EFFICIENCY.name,
      description: KEYWORDS.EFFICIENCY.description,
      icon: 'keyword-efficiency',
      mixins: [
        new CardInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor: originalCost => {
            if (!isDefined(originalCost)) return originalCost;
            return Math.max(0, originalCost - this.target.player.hero.level);
          }
        })
      ]
    });
  }
}
