import { KEYWORDS } from '../../card/card-keywords';
import type { ArtifactCard } from '../../card/entities/artifact.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class UniqueModifier<T extends MinionCard | ArtifactCard> extends Modifier<T> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.UNIQUE.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.UNIQUE),
        // @ts-expect-error TODO make interceptor modifiers to handle cross card kind interceptors that are not present on the base Card class
        new MinionInterceptorModifierMixin(game, {
          key: 'canPlay',
          interceptor(value, ctx) {
            if (!value) return value;
            const cards = ctx.player.boardSide
              .getAllCardsInPlay()
              .filter(c => c.blueprintId === ctx.blueprintId);

            return cards.length === 0;
          }
        })
      ]
    });
  }
}
