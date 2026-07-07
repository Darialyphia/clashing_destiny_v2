import { KEYWORDS } from '../../card/card-keywords';
import type { JobId } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier } from '../modifier.entity';

export class JobBonusModifier<T extends AnyCard = AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private jobId: JobId
  ) {
    const keyword = KEYWORDS[`${jobId.toUpperCase()}_BONUS` as keyof typeof KEYWORDS];
    super(keyword.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, keyword),
        new TogglableModifierMixin(game, () => this.isActive)
      ]
    });
  }

  get isActive() {
    return this.target.player.hero?.hasJob(this.jobId);
  }
}
