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

export class HeroInterceptModifier extends Modifier<MinionCard> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<MinionCard>[] }
  ) {
    super(KEYWORDS.HERO_INTERCEPT.id, game, source, {
      name: KEYWORDS.HERO_INTERCEPT.name,
      description: KEYWORDS.HERO_INTERCEPT.description,
      icon: 'keyword-hero-intercept',
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.HERO_INTERCEPT),
        new GrantAbilityModifierMixin(game, {
          id: 'hero-intercept',
          description: 'Intercept attack.',
          label: 'Intercept',
          isHiddenOnCard: true,
          getPreResponseTargets: () => Promise.resolve([]),
          canUse: () => {
            const minion = this.target;
            if (minion.isExhausted) return false;

            const phaseCtx = this.game.gamePhaseSystem.getContext();
            if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;
            return !!phaseCtx.ctx.target?.equals(minion.player.hero);
          },
          manaCost: 0,
          shouldExhaust: false,
          speed: CARD_SPEED.FLASH,
          async onResolve(game, card) {
            const phaseCtx =
              game.gamePhaseSystem.getContext<BetterExtract<GamePhase, 'attack_phase'>>();
            phaseCtx.ctx.changeTarget(card);
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
