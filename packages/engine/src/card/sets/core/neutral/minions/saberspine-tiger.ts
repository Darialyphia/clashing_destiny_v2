import { RushModifier } from '../../../../../modifier/modifiers/rush.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

export const saberspineTiger: MinionBlueprint = {
  id: 'saberspine-tiger',
  name: 'Saberspine Tiger',
  description: '<rt-keyword>Rush</rt-keyword>.',
  kind: CARD_KINDS.MINION,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  rarity: RARITIES.RARE,
  tags: [],
  subKind: MINION_TYPES.MELEE,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 3,
  atk: 3,
  maxHp: 2,
  retaliation: 0,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new RushModifier(game, card));
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
