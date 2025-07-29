import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.card';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class RushModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.RUSH.id, game, source, {
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RUSH),
        new MinionInterceptorModifierMixin(game, {
          key: 'hasSummoningSickness',
          interceptor: () => false
        })
      ]
    });
  }
}
