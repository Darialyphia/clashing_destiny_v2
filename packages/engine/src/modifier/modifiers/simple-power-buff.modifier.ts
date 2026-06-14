import { isFunction } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimplePowerBuffModifier<
  T extends MinionCard | HeroCard
> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number | (() => number);
      name?: string | (() => string);
      mixins?: ModifierMixin<T>[];
      isUnique?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      isUnique: options.isUnique ?? true,
      icon: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'keyword-power-buff' : 'keyword-power-debuff';
      },
      name: () => {
        const name = isFunction(options.name) ? options.name() : options.name;
        if (name) return name;

        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'Power Buff' : 'Power Debuff';
      },
      description: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return `${amount > 0 ? '+' : '-'}${options.amount} Power`;
      },
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new UnitInterceptorModifierMixin(game, {
          key: 'power',
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
