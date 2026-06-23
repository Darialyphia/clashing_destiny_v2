import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class VulnerableModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<T>[] } = { mixins: [], amount: 1 }
  ) {
    super(KEYWORDS.VULNERABLE.id, game, source, {
      icon: 'icons/keyword-vulnerable',
      name: KEYWORDS.VULNERABLE.name,
      description: KEYWORDS.VULNERABLE.description,
      isUnique: true,
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'receivedDamage',
          interceptor: damage => {
            return Math.max(0, damage + options.amount);
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
