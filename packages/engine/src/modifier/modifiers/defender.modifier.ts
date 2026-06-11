import { isFunction } from '@game/shared';
import type { Game } from '../..';
import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class DefenderModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      amount: number | (() => number);
      mixins?: Array<ModifierMixin<MinionCard>>;
    }
  ) {
    super(KEYWORDS.DEFENDER.id, game, source, {
      name: KEYWORDS.DEFENDER.name,
      description: KEYWORDS.DEFENDER.description,
      icon: 'icons/keyword-defender',
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'power',
          interceptor: (value, ctx) => {
            if (!game.combatSystem.defender?.equals(ctx)) return value;

            const amount = isFunction(options.amount) ? options.amount() : options.amount;
            return value + amount;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
