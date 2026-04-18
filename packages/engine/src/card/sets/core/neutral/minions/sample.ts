import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';

export const sample: MinionBlueprint = {
  id: 'sample',
  name: 'Sample',
  description: 'This is a sample minion.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL.id],
  manaCost: 1,
  tags: [],
  atk: 1,
  retaliation: 1,
  maxHp: 1,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay(game, card) {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
