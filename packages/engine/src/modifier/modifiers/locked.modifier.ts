import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class LockedModifier<T extends AnyCard> extends Modifier<T> {
  private hasBeenAttacked = 0;

  constructor(
    game: Game,
    source: AnyCard,
    options: { duration: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.LOCKED.id, game, source, {
      name: KEYWORDS.LOCKED.name,
      description: KEYWORDS.LOCKED.description,
      icon: 'keyword-locked',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LOCKED),
        new CardInterceptorModifierMixin(game, {
          // @ts-expect-error
          key: 'canPlay',
          interceptor: () => {
            return false;
          }
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'canBeRecollected',
          interceptor: () => {
            return false;
          }
        }),
        new DurationModifierMixin(game, options.duration),
        ...(options.mixins || [])
      ]
    });
  }
}
