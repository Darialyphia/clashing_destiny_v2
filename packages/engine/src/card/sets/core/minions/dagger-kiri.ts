import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';
import { FACTION_IDS } from '../../../factions/factions';

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
  manaCost: 3,
  manaSupply: 3,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.SONGHAI,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 4,
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
