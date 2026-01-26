import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { isMinion } from '../../../../card-utils';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';
import { GAME_PHASES } from '../../../../../game/game.enums';

export const secondWings: MinionBlueprint = {
  id: 'second-wings',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Second Wings',
  description: dedent`
    @Honor@.
    @On Death@: If this was destroyed by combat by a minion, destroy the minion that destroyed it.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
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
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler(event) {
          const phaseCtx = game.gamePhaseSystem.getContext();
          if (phaseCtx.state !== GAME_PHASES.ATTACK) return;
          if (!isMinion(event.data.source)) return;
          if (!event.data.source.isAlive) return;

          if (
            phaseCtx.ctx.attacker.equals(event.data.source) ||
            phaseCtx.ctx.target?.equals(event.data.source) ||
            phaseCtx.ctx.blocker?.equals(event.data.source)
          ) {
            await event.data.source.destroy(card);
          }
        }
      })
    );
  },
  async onPlay() {}
};
