import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { GAME_PHASES } from '../../../../../game/game.enums';
import { isMinion } from '../../../../card-utils';
import type { MinionCard } from '../../../../entities/minion.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { PreemptiveRetaliationModifier } from '../../../../../modifier/modifiers/preemptive-retaliation';

export const crossCounter: SpellBlueprint = {
  id: 'cross-counter',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Cross Counter',
  description: dedent`
   Wake up target exhausted ally minion that is targeted by an attack. Give it @Preemptive Retaliation@ this turn.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay(game, card) {
    const phaseCtx = game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;

    const attacker = phaseCtx.ctx.attacker;
    const target = phaseCtx.ctx.target;

    return (
      !!attacker &&
      !!target &&
      isMinion(target) &&
      target.isExhausted &&
      target.isAlly(card)
    );
  },
  getPreResponseTargets() {
    return Promise.resolve([]);
  },
  async onInit() {},
  async onPlay(game, card) {
    const phaseCtx = game.gamePhaseSystem.getContext();
    if (phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.target) {
      await phaseCtx.ctx.target.wakeUp();
      await (phaseCtx.ctx.target as MinionCard).modifiers.add(
        new PreemptiveRetaliationModifier(game, card, {
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
