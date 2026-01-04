import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { PrideModifier } from '../../../../../modifier/modifiers/pride.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { GAME_PHASES } from '../../../../../game/game.enums';
import { BOARD_SLOT_ZONES } from '../../../../../board/board.constants';

export const braveCitizen: MinionBlueprint = {
  id: 'brave-citizen',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Brave Citizen',
  description: dedent`
    @Pride 1@
    @Attacker@: +1 Atk
    @Defender@: +1 Hp
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.COMMON,
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
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new PrideModifier(game, card, 1));

    await card.modifiers.add(
      new SimpleAttackBuffModifier(`${card.id}-attacker`, game, card, {
        amount: 1,
        mixins: [
          new TogglableModifierMixin(game, () => {
            return (
              card.location === CARD_LOCATIONS.BOARD &&
              card.zone === BOARD_SLOT_ZONES.ATTACK_ZONE
            );
          })
        ]
      })
    );

    // Defender bonus: +1 HP when defending
    await card.modifiers.add(
      new SimpleHealthBuffModifier(`${card.id}-defender`, game, card, {
        amount: 1,
        mixins: [
          new TogglableModifierMixin(game, () => {
            const phaseCtx = game.gamePhaseSystem.getContext();
            if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;
            return (
              !!phaseCtx.ctx.target?.equals(card) || !!phaseCtx.ctx.blocker?.equals(card)
            );
          })
        ]
      })
    );
  },
  async onPlay() {}
};
