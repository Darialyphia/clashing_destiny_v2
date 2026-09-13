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
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { DefenderModifier } from '../../../../modifier/modifiers/defender.modifier';
import { SimpleCommandmentBuffModifier } from '../../../../modifier/modifiers/simple-commandment-modifier';

export const silverGuardKnight: MinionBlueprint = {
  id: 'silverguard-knight',
  name: 'Silverguard Knight',
  description: dedent /*html*/ `
  <rt-keyword>Protector</rt-keyword>.
  <rt-keyword>Zeal</rt-keyword>: Gains +1/+0/+0 and <rt-keyword>Defender 2</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/silverguard-knight'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 5,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new ProtectorModifier(game, card));
    await card.modifiers.add(
      new ZealModifier(game, card, {
        zealedModifiers: [
          new SimpleCommandmentBuffModifier('silverguard-knight-cmd-buff', game, card, {
            amount: 1
          }),
          new DefenderModifier(game, card, { amount: 2 })
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
