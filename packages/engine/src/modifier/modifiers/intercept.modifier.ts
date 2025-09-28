import { KEYWORDS } from '../../card/card-keywords';
import { CARD_SPEED } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import type { BetterExtract } from '@game/shared';

export class InterceptModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.INTERCEPT.id, game, source, {
      name: KEYWORDS.INTERCEPT.name,
      description: KEYWORDS.INTERCEPT.description,
      icon: 'keyword-intercept',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INTERCEPT),
        new GrantAbilityModifierMixin(game, {
          id: 'intercept',
          description: 'Intercept attack.',
          label: 'Intercept',
          isHiddenOnCard: true,
          getPreResponseTargets: () => Promise.resolve([]),
          canUse: () => {
            const minion = this.target;
            if (minion.isExhausted) return false;

            const phaseCtx = this.game.gamePhaseSystem.getContext();
            if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;

            const attackTarget = phaseCtx.ctx.target;
            if (!attackTarget) return false;
            const neighbors = minion.slot?.adjacentMinions ?? [];
            if (!neighbors.some(m => m.isAlly(minion) && m.equals(attackTarget))) {
              return false;
            }

            return true;
          },
          manaCost: 0,
          shouldExhaust: false,
          speed: CARD_SPEED.FLASH,
          async onResolve(game, card) {
            const phaseCtx =
              game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();
            const attackTarget = phaseCtx.ctx.target as MinionCard;
            await card.moveTo(attackTarget.slot!, true);
            phaseCtx.ctx.changeTarget(card);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
