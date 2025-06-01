import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class LineageBonusModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private heroId: string
  ) {
    super(`${KEYWORDS.LINEAGE_BONUS}_${heroId}`, game, source, {
      mixins: [new KeywordModifierMixin(game, KEYWORDS.LEVEL_BONUS)]
    });
  }

  get isActive() {
    return this.target.player.hero.hasLineage(this.heroId);
  }
}
