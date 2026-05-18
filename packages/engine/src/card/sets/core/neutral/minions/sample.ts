import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

export const sample: MinionBlueprint = {
  id: 'sample',
  name: 'Sample',
  description: 'This is a sample minion.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [],
  affinity: AFFINITIES.NEUTRAL,
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  subKind: MINION_TYPES.MELEE,
  tags: [],
  atk: 1,
  maxHp: 2,
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
