import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class LevelBonusModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private level: number
  ) {
    super(`${KEYWORDS.LEVEL_BONUS}_${level}`, game, source, {
      mixins: [new KeywordModifierMixin(game, KEYWORDS.LEVEL_BONUS)]
    });
  }

  get isActive() {
    return this.target.player.hero.level >= this.level;
  }
}
