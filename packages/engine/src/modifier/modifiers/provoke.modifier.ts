import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { ModifierMixin } from '../modifier-mixin';
import { UnitAuraModifierMixin } from '../mixins/aura.mixin';
import { UnitEffectModifierMixin } from '../mixins/unit-effect.mixin';
import type { Unit } from '../../unit/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import { isDefined } from '@game/shared';
import { ProvokedTargetingStrategy } from '../../targeting/provoked-targeting-strategy';

export class ProvokeModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options?: { mixins: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new UnitEffectModifierMixin(game, {
          getModifier: () => new ProvokeUnitModifier(game, this.initialSource)
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}

export class ProvokeUnitModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.PROVOKE.id, game, source, {
      name: KEYWORDS.PROVOKE.name,
      description: KEYWORDS.PROVOKE.description,
      icon: 'icons/keyword-provoke',
      mixins: [
        new TogglableModifierMixin(game, () => this.target.isOnFrontRow),
        new UnitAuraModifierMixin(game, source, {
          isElligible: candidate => {
            return this.shouldBeProvoked(candidate);
          },
          getModifiers: candidate => {
            return [
              new Modifier('provoked', this.game, source, {
                mixins: [
                  new UnitInterceptorModifierMixin(game, {
                    key: 'attackTargetingPattern',
                    interceptor: () => {
                      return new ProvokedTargetingStrategy(game, candidate);
                    }
                  }),
                  new UnitInterceptorModifierMixin(game, {
                    key: 'canMove',
                    interceptor: () => {
                      return false;
                    }
                  })
                ]
              })
            ];
          }
        })
      ]
    });
  }

  private shouldBeProvoked(candidate: Unit): boolean {
    return candidate.isEnemy(this.target) && candidate.x === this.target.x;
  }
}
