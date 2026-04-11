import { isFunction } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/unit.entity';
import {
  MinionInterceptorModifierMixin,
  UnitInterceptorModifierMixin
} from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class UnitSimpleAttackBuffModifier<T extends Unit> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number | (() => number);
      name?: string | (() => string);
      mixins?: ModifierMixin<T>[];
      isRemovable?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      icon: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'icons/keyword-attack-buff' : 'icons/keyword-attack-debuff';
      },
      name: () => {
        const name = isFunction(options.name) ? options.name() : options.name;
        if (name) return name;

        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return amount > 0 ? 'Attack Buff' : 'Attack Debuff';
      },
      description: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return `${amount > 0 ? '+' : '-'}${options.amount} Attack`;
      },
      isUnique: true,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
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

export class MinionSimpleAttackBuffModifier<T extends MinionCard> extends Modifier<T> {
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
        return amount > 0 ? 'Attack Buff' : 'Attack Debuff';
      },
      description: () => {
        const amount = isFunction(options.amount) ? options.amount() : options.amount;
        return `${amount > 0 ? '+' : '-'}${amount} Attack`;
      },
      mixins: [
        new MinionInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            const amount = isFunction(options.amount) ? options.amount() : options.amount;
            return value + amount * this.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
