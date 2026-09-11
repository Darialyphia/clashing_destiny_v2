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
import { BackstabModifier } from '../../../../modifier/modifiers/backstab.modifier';

export const kaidoAssassin: MinionBlueprint = {
  id: 'kaido-assassin',
  name: 'Kaido Assasin',
  description: dedent /*html*/ `
  <rt-keyword>Backstab 1</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/kaido-assasin'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new BackstabModifier(game, card, { amount: 1 }));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
