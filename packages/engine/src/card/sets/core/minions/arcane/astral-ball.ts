import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { OnScoreModifier } from '../../../../../modifier/modifiers/on-score.modifier';
import { predict } from '../../../../card-actions-utils';

export const astralBall: MinionBlueprint = {
  id: 'astralBall',
  name: 'Astral Ball',
  description: dedent /*html*/ `
  <rt-trigger>On Score</rt-trigger> <rt-keyword>Predict, then destroy this minion.
  `,
  collectable: false,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  jobs: [],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 1,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 0,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        handler: async () => {
          await predict(game, card);
          await card.destroy(card);
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
