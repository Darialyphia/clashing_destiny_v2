import { isFunction } from '@game/shared';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleHealthBuffModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number | (() => number);
      name?: string | (() => string);
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      name: () => {
        const name = isFunction(options.name) ? options.name() : options.name;
        if (name) return name;

        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'Health Buff' : 'Health Debuff';
      },
      description: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return `${amount > 0 ? '+' : ''}${amount} Health`;
      },
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new MinionInterceptorModifierMixin(game, {
          key: 'maxHp',
          interceptor: value => {
            const amount = isFunction(options.amount) ? options.amount() : options.amount;
            return Math.max(0, value + amount * this._stacks);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
