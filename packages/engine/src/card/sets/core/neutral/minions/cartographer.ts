import dedent from 'dedent';
import { MinionOnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { UnitSimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';

export const cartographer: MinionBlueprint = {
  id: 'cartographer',
  name: 'Cartographer',
  description: dedent`<rt-trigger>On Enter</rt-trigger>: Draw a card at the end of the turn.
  <rt-lvl-bonus lvl="3">Draw it now instead.</rt-lvl-bonus> `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 1,
  tags: [],
  atk: 1,
  retaliation: 0,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new MinionOnEnterModifier(game, card, async () => {
        if (lvlMod.isActive) {
          await card.player.cardManager.drawFromDeck(1);
        } else {
          game.once(GAME_EVENTS.TURN_END, async () => {
            await card.player.cardManager.drawFromDeck(1);
          });
        }
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
