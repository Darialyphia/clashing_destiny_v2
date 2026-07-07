import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class UniqueModifier<T extends MinionCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.UNIQUE.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.UNIQUE),
        new MinionInterceptorModifierMixin(game, {
          key: 'canPlay',
          interceptor(value, ctx) {
            if (!value) return value;
            const cards = ctx.player.allCardsInPlay.filter(
              c => c.blueprintId === ctx.blueprintId
            );

            return cards.length === 0;
          }
        })
      ]
    });
  }
}
