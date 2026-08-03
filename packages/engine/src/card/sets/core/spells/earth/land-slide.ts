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

export const landSlide: SpellBlueprint = {
  id: 'landSlide',
  name: 'Land Slide',
  description: dedent /*html*/ `
    Move a minion with a cost of <rt-mana>3</rt-mana> or less to its controller's base.
    <rt-runes runes="might,focus"></rt-runes> It also gains "<rt-trigger>On Move</rt-trigger> This takes 1 damage" this turn.
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
