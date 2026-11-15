import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';

export const tutorialSunbreaker: MinionBlueprint = {
  id: 'tutorial-sunbreaker',
  name: 'Sunbreaker',
  description: dedent /*html*/ `
  <rt-keyword>Overwhelm</rt-keyword>.
  `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/sunbreaker'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 3,
  manaSupply: 2,
  level: 1,
  exp: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 4,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new OverwhelmModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
