import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import {
  CardInterceptorModifierMixin,
  MinionInterceptorModifierMixin
} from '../mixins/interceptor.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class FreezeModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FROZEN.id, game, source, {
      name: KEYWORDS.FROZEN.name,
      description: KEYWORDS.FROZEN.description,
      icon: 'keyword-frozen',
      isUnique: true,
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new DurationModifierMixin(game, 2),
        new CardInterceptorModifierMixin(game, {
          key: 'shouldWakeUpAtTurnStart',
          interceptor: () => false
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: () => 0
        }) as ModifierMixin<T>
      ]
    });
  }
}
