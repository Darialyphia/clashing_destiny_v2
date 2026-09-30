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
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';

export const windDervish: MinionBlueprint = {
  id: 'wind-dervish',
  name: 'Wind Dervish',
  description: dedent /*html*/ `
 <rt-keyword>Ephemeral</rt-keyword>.
  `,
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/wind-dervish'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 1,
  affinities: [AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new EphemeralModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
