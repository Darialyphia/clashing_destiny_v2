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
import { OverwhelmModifier } from '../../../../modifier/modifiers/overwhelm.modifier';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';

export const daggerKiri: MinionBlueprint = {
  id: 'dagger-kiri',
  name: 'Dagger Kiri',
  description: dedent /*html*/ `
  <rt-keyword>Double Attack</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/dagger-kiri'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 6,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new DoubleAttackModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
