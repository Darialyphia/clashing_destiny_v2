import { KEYWORDS } from '../../card/card-keywords';
import type { HeroJob } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier } from '../modifier.entity';

export class HeroJobAffinityModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private job: HeroJob
  ) {
    super(`${KEYWORDS[`${job}_AFFINITY`].id}`, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS[`${job}_AFFINITY`]),
        new TogglableModifierMixin(game, () => this.isActive)
      ]
    });
  }

  get isActive() {
    if (!this.target.player.hero) return false;
    return this.target.player.hero.jobs.includes(this.job);
  }
}
