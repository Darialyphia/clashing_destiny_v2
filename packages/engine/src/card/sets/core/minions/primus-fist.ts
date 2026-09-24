import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isMinion } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';

export const primusFist: MinionBlueprint = {
  id: 'primus-fist',
  name: 'Primus Fist',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> Give adjacent allies +0/+1/+0.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/primus-fist'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL, AFFINITIES.NEUTRAL],
  manaCost: 2,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const targets = card.position!.adjacentCards.filter(isMinion);

          for (const target of targets) {
            await target.modifiers.add(
              new SimpleAttackBuffModifier('primus-fist-atk-buff', game, card, {
                amount: 1
              })
            );
          }
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
