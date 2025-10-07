import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { RemoveOnDestroyedMixin } from '../mixins/remove-on-destroyed';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleManacostModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      mixins?: ModifierMixin<T>[];
    }
  ) {
    super(modifierType, game, card, {
      mixins: [
        new RemoveOnDestroyedMixin(game),
        new CardInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor: value => {
            if (value === null) return value;

            return value + options.amount;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
