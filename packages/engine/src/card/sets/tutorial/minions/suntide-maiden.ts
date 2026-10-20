import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';

export const tutorialSuntideMaiden: MinionBlueprint = {
  id: 'tutorial-suntide-maiden',
  name: 'Suntide Maiden',
  description: dedent /*html*/ ` `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/suntide-maiden'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 5,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  commandment: 3,
  canPlay: () => true,
  abilities: [],
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
