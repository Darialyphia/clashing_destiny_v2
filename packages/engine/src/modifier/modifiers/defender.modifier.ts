import { KEYWORDS } from '../../card/card-keywords';
import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class DefenderModifier<T extends MinionCard | HeroCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { amount: number; mixins?: ModifierMixin<T>[] }
  ) {
    super(KEYWORDS.ATTACKER.id, game, source, {
      name: KEYWORDS.DEFENDER.name,
      description: KEYWORDS.DEFENDER.description,
      icon: `keyword-${KEYWORDS.DEFENDER.id}`,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'atk',
          interceptor: value => value + options.amount
        }),
        new TogglableModifierMixin(game, () => {
          const phaseCtx = game.gamePhaseSystem.getContext();
          if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;

          return (
            !!phaseCtx.ctx.target?.equals(this.target) &&
            phaseCtx.ctx.isTargetCounterattacking
          );
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
