import { KEYWORDS } from '../../card/card-keywords';
import type { SpellSchool } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { Modifier } from '../modifier.entity';

export class SpellSchoolAffinityModifier<T extends AnyCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    private school: SpellSchool
  ) {
    super(`${KEYWORDS[`${school}_AFFINITY`].id}`, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS[`${school}_AFFINITY`]),
        new TogglableModifierMixin(game, () => this.isActive)
      ]
    });
  }

  get isActive() {
    if (!this.target.player.hero) return false;
    return this.target.player.hero.spellSchools.includes(this.school);
  }
}
