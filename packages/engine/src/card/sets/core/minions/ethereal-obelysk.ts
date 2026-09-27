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
import { SpawnModifier } from '../../../../modifier/modifiers/spawn.modifier';
import { windDervish } from './wind-dervish';

export const etherealObelysk: MinionBlueprint = {
  id: 'ethereal-obelysk',
  name: 'Ethereal Obelysk',
  description: dedent /*html*/ `
  <rt-keyword>Structure</rt-keyword>.
  <rt-keyword>Spawn</rt-keyword>: <rt-card>Wind Dervish</rt-card>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/ethereal-obelysk'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 2,
  affinities: [AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new EphemeralModifier(game, card));
    await card.modifiers.add(
      new SpawnModifier(game, card, {
        blueprint: () => windDervish
      })
    );
  },
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1,
    shouldAttack: () => 1,
    shouldMove: () => 1,
    getThreatScore: () => 1
  }
};
