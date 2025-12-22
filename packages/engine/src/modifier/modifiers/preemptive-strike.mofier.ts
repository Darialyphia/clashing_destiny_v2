import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class PreemptiveStrikeModifier<
  T extends MinionCard | HeroCard
> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.PREEMPTIVE_STRIKE.id, game, source, {
      name: KEYWORDS.PREEMPTIVE_STRIKE.name,
      description: KEYWORDS.PREEMPTIVE_STRIKE.description,
      icon: 'keyword-preemptive-strike',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PREEMPTIVE_STRIKE),
        new UnitInterceptorModifierMixin(game, {
          key: 'dealsDamageFirst',
          interceptor: value => {
            if (!value) return value;
            const gamePhaseCtx = game.gamePhaseSystem.getContext();
            if (gamePhaseCtx.state !== GAME_PHASES.ATTACK) return value;

            return gamePhaseCtx.ctx.attacker === this.target;
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
