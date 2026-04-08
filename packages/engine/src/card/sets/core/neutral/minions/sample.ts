import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  defaultCardTint,
  JOBS,
  RARITIES
} from '../../../../card.enums';

export const sample: MinionBlueprint = {
  id: 'sample',
  name: 'Sample',
  description: 'This is a sample minion.',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder', defaultCardTint),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.NEUTRAL],
  manaCost: 1,
  tags: [],
  atk: 1,
  retaliation: 1,
  maxHp: 1,
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
