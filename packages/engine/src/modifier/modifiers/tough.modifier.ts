import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class ToughModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<T>[] } = { mixins: [], amount: 1 }
  ) {
    super(KEYWORDS.TOUGH.id, game, source, {
      icon: 'keyword-tough',
      name: KEYWORDS.TOUGH.name,
      description: KEYWORDS.TOUGH.description,
      isUnique: true,
      mixins: [
        // @ts-expect-error
        new MinionInterceptorModifierMixin(game, {
          key: 'receivedDamage',
          interceptor: damage => {
            return Math.max(0, damage - options.amount);
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
