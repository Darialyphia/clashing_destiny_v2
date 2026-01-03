import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { MinionInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class PrideModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    private requiredLevel: number,
    options: { mixins?: ModifierMixin<MinionCard>[] } = {}
  ) {
    super(`${KEYWORDS.PRIDE.id}_${requiredLevel}`, game, source, {
      isUnique: true,
      name: `${KEYWORDS.PRIDE.name.replace('X', requiredLevel.toString())}`,
      description: KEYWORDS.PRIDE.description.replace(
        'level X',
        `level ${requiredLevel}`
      ),
      icon: 'keyword-locked',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PRIDE),
        new TogglableModifierMixin(game, () => !this.isLevelRequirementMet()),
        new MinionInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: value => {
            if (!value) return value;
            return this.isLevelRequirementMet();
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canBlock',
          interceptor: value => {
            if (!value) return value;
            return this.isLevelRequirementMet();
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canRetaliate',
          interceptor: value => {
            if (!value) return value;
            return this.isLevelRequirementMet();
          }
        }),
        new MinionInterceptorModifierMixin(game, {
          key: 'canUseAbility',
          interceptor: value => {
            if (!value) return value;
            return this.isLevelRequirementMet();
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }

  private isLevelRequirementMet(): boolean {
    if (!this.target.player.hero) return false;
    return this.target.player.hero.level >= this.requiredLevel;
  }
}
