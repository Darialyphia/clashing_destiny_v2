import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../../card.enums';

export const sampl2: MinionBlueprint = {
  id: 'sample2',
  name: 'Sample2',
  description: 'This is another sample minion.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 0,
    shouldMove: () => 0,
    shouldAttack: () => 0,
    getThreatScore: () => 0
  }
};
