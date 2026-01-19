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
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { GAME_PHASES } from '../../../../../game/game.enums';
import { isMinion } from '../../../../card-utils';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionCard } from '../../../../entities/minion.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const crossCounter: SpellBlueprint = {
  id: 'cross-counter',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Cross Counter',
  description: dedent`
   Wake up target exhausted ally minion that is targeted by an attack. Give it +1 ATK this turn.
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
        new SimpleAttackBuffModifier('cross-counter-attack-buff', game, card, {
          amount: 1,
          mixins: [new UntilEndOfTurnModifierMixin(game)]
        })
      );
    }
  }
};
