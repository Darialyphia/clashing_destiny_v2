import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
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
      isRemovable?: boolean;
    }
  ) {
    super(modifierType, game, card, {
      isRemovable: options.isRemovable,
      mixins: [
        // @ts-expect-error
        new CardInterceptorModifierMixin(game, {
          key: 'manaCost',
          interceptor: value => {
            if (value === null) return value;

            return Math.max(0, value + options.amount);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
