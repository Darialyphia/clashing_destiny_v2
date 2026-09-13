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
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const windbladeAdept: MinionBlueprint = {
  id: 'windblade-adept',
  name: 'Windblade Adept',
  description: dedent /*html*/ `
  <rt-keyword>Zeal</rt-keyword>: Gains +1/+1/+0.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/windblade-adept'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 2,
  manaSupply: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new ZealModifier(game, card, {
        zealedModifiers: [
          new SimpleAttackBuffModifier('windblade-adept-atk', game, card, {
            amount: 1
          }),
          new SimpleCommandmentBuffModifier('windblade-adept-hp', game, card, {
            amount: 1
          })
        ]
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
