import type { SpellBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
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
  jobs: [],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getTargets: noTargets,
  async onInit(game, card) {},
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 0
  }
};
