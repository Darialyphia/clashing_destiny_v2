import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';

export const invigorate: SpellBlueprint = {
  id: 'invigorate',
  name: 'Invigorate',
  description: dedent /*html*/ `
   Give a minion +0/+0/+2.
   <rt-runes runes="wisdom,wisdom"></rt-runes>It also gains "<rt-keyword>Channel</rt-keyword> Fully heal this minion".
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.EARTH],
  manaCost: 2,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {},
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 1
  }
};
