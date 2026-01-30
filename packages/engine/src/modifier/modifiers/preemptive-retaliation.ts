import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class PreemptiveRetaliationModifier<
  T extends MinionCard | HeroCard
> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.PREEMPTIVE_RETALIATION.id, game, source, {
      name: KEYWORDS.PREEMPTIVE_RETALIATION.name,
      description: KEYWORDS.PREEMPTIVE_RETALIATION.description,
      icon: 'keyword-preemptive-strike',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PREEMPTIVE_STRIKE),
        new UnitInterceptorModifierMixin(game, {
          key: 'dealsDamageFirst',
          interceptor: value => {
            const gamePhaseCtx = game.gamePhaseSystem.getContext();
            if (gamePhaseCtx.state !== GAME_PHASES.ATTACK) return value;

            return !!(
              gamePhaseCtx.ctx.target?.equals(this.target) ||
              gamePhaseCtx.ctx.blocker?.equals(this.target)
            );
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
