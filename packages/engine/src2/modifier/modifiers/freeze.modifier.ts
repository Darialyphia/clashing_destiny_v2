import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class FreezeModifier<T extends Unit> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FROZEN.id, game, source, {
      name: KEYWORDS.FROZEN.name,
      description: KEYWORDS.FROZEN.description,
      icon: 'icons/keyword-frozen',
      isUnique: true,
      mixins: [
        new DurationModifierMixin(game, 2),
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldActivateOnTurnStart',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: () => 0
        }) as ModifierMixin<T>
      ]
    });
  }
}
