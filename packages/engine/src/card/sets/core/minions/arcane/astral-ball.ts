import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, noTargets } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { predict } from '../../../../card-actions-utils';
import { OnDeathModifier } from '../../../../../modifier/modifiers/on-death.modifier';

export const astralBall: MinionBlueprint = {
  id: 'astralBall',
  name: 'Astral Ball',
  description: dedent /*html*/ `
  <rt-trigger>On Destroyed</rt-trigger>: <rt-keyword>Predict</rt-keyword>.
  `,
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        handler: async () => {
          await predict(game, card);
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
