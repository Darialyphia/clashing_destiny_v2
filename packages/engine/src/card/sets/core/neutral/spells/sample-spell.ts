import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  RARITIES
} from '../../../../card.enums';

export const sampleSpell: SpellBlueprint = {
  id: 'sampleSpell',
  name: 'Sample Spell',
  description: 'This is a sample spell.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 1,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getTargets(game, card) {
    return Promise.resolve([]);
  },
  async onInit(game, card) {},
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 0
  }
};
