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
import { ProtectorModifier } from '../../../../modifier/modifiers/protector.modifier';

export const primusShieldmaster: MinionBlueprint = {
  id: 'primus-shieldmaster',
  name: 'Primus Shieldmaster',
  description: dedent /*html*/ `
  <rt-keyword>Protector</rt-keyword>
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/primus-shieldmaster'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 5,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ProtectorModifier(game, card));
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
