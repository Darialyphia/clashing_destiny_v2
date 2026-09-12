import { isFunction } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';

export class SimpleCommandmentBuffModifier extends Modifier<MinionCard> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number | (() => number);
      name?: string | (() => string);
      mixins?: ModifierMixin<MinionCard>[];
      isUnique?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      isUnique: options.isUnique ?? true,
      name: () => {
        const name = isFunction(options.name) ? options.name() : options.name;
        if (name) return name;

        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'Commandment Buff' : 'Commandment Debuff';
      },
      description: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return `${amount > 0 ? '+' : '-'}${options.amount} Commandment`;
      },
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new MinionInterceptorModifierMixin(game, {
          key: 'commandment',
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
