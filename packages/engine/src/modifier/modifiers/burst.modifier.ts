import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class BurstModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.BURST.id, game, source, {
      mixins: [
        new CardInterceptorModifierMixin(game, {
          key: 'shouldSwitchInitiativeAfterPlay',
          interceptor: () => {
            return false;
          }
        }),
        new CardInterceptorModifierMixin(game, {
          key: 'shouldCreateChainWhenPlayed',
          interceptor: () => {
            return false;
          }
        }),
        ...(options?.mixins || [])
      ]
    });
  }
}
