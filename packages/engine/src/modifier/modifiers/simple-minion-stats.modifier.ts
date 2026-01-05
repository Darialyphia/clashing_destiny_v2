import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleMinionStatsModifier<T extends MinionCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      attackAmount: number;
      healthAmount: number;
      name?: string;
      mixins?: ModifierMixin<T>[];
      isDebuff?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      isUnique: true,
      icon: options.isDebuff ? 'keyword-stats-debuff' : 'keyword-stats-buff',
      name: options.name ?? (options.isDebuff ? 'Stats Debuff' : 'Stats Buff'),
      description: `${options.attackAmount > 0 ? '+' : '-'}${options.attackAmount} Attack / ${options.healthAmount > 0 ? '+' : '-'}${options.healthAmount} Health`,
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => {
            return value + options.attackAmount * this._stacks;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxHp',
          interceptor: value => {
            return value + options.healthAmount * this._stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
