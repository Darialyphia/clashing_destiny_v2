import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt } from '../../../card-utils';
import { CARD_SETS, CARD_KINDS, RARITIES, CARD_SPEED } from '../../../card.enums';
import { CleaveModifier } from '../../../../modifier/modifiers/cleave.modifier';
import { OnKillModifier } from '../../../../modifier/modifiers/on-kill.modifier';
import { FACTION_IDS } from '../../../factions/factions';

export const sunbreaker: MinionBlueprint = {
  id: 'sunbreaker',
  name: 'Sunbreaker',
  description: dedent /*html*/ `
  <rt-keyword>Cleave 3</rt-keyword>.
  <rt-trigger>On Kill</rt-trigger> Gain 1 influence on this battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/sunbreaker'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  manaCost: 4,
  manaSupply: 2,
  level: 4,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 5,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new CleaveModifier(game, card, { amount: 3 }));

    await card.modifiers.add(
      new OnKillModifier(game, card, {
        async handler() {
          await card.battlefield?.gainScore(1);
        }
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
