import { isFunction } from '@game/shared';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import {
  RemoveAfterPlayedModifierMixin,
  RemoveOnDestroyedMixin
} from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleManacostModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number | (() => number);
      minimumCost?: number;
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      mixins: [
        new RemoveAfterPlayedModifierMixin(game),
        new CardInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor: value => {
            if (value === null) return value;

            return Math.max(
              options.minimumCost ?? 0,
              value + (isFunction(options.amount) ? options.amount() : options.amount)
            );
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
