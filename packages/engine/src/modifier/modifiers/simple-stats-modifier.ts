import { isFunction } from '@game/shared';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleStatsBuffModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      atk: number | (() => number);
      cmd: number | (() => number);
      hp: number | (() => number);
      name?: string | (() => string);
      mixins?: ModifierMixin<T>[];
      isUnique?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      isUnique: options.isUnique ?? true,
      name: () => {
        const name = isFunction(options.name) ? options.name() : options.name;
        if (name) return name;

        const atk = isFunction(options.atk) ? options.atk() : options.atk;
        const cmd = isFunction(options.cmd) ? options.cmd() : options.cmd;
        const hp = isFunction(options.hp) ? options.hp() : options.hp;
        return atk > 0 || cmd > 0 || hp > 0 ? 'Stats Buff' : 'Stats Debuff';
      },
      description: () => {
        const cmd = isFunction(options.cmd) ? options.cmd() : options.cmd;
        const atk = isFunction(options.atk) ? options.atk() : options.atk;
        const hp = isFunction(options.hp) ? options.hp() : options.hp;
        return `${cmd > 0 ? '+' : ''}${cmd} / ${atk > 0 ? '+' : ''}${atk} / ${hp > 0 ? '+' : ''}${hp}.`;
      },
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new MinionInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            const atk = isFunction(options.atk) ? options.atk() : options.atk;
            return Math.max(0, value + atk * this._stacks);
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'commandment',
          interceptor: value => {
            const cmd = isFunction(options.cmd) ? options.cmd() : options.cmd;
            return Math.max(0, value + cmd * this._stacks);
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'maxHp',
          interceptor: value => {
            const hp = isFunction(options.hp) ? options.hp() : options.hp;
            return Math.max(0, value + hp * this._stacks);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
