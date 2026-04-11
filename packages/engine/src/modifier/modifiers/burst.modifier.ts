import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { Game } from '../../game/game';
import { CardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class BurstModifier<T extends AnyCard> extends Modifier<T> {
  constructor(game: Game, card: AnyCard, options?: { mixins: ModifierMixin<T>[] }) {
    super(KEYWORDS.BURST.id, game, card, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BURST),
        // @ts-expect-error
        new CardInterceptorModifierMixin(game, {
          key: 'shouldPassInitiativeAfterPlay',
          interceptor: () => false
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
