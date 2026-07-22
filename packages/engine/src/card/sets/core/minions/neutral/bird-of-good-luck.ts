import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  JOBS
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';

export const birdOfGoodLuck: MinionBlueprint = {
  id: 'birdOfGoodLuck',
  name: 'Bird of Good Luck',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> Gain 1 influence on battlefields where you have less influence than your opponent.
  <rt-runes runes="might,resonance,focus,wisdom"></rt-runes> Gain 2 influence instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.EPIC,
  jobs: [JOBS.TAMER],
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const amountToGain = card.player.runeManager.has({
            might: 1,
            resonance: 1,
            focus: 1,
            wisdom: 1
          })
            ? 2
            : 1;
          if (card.player.boardSide.leftBattlefield.isLosing) {
            await card.player.boardSide.leftBattlefield.gainScore(amountToGain);
          }
          if (card.player.boardSide.rightBattlefield.isLosing) {
            await card.player.boardSide.rightBattlefield.gainScore(amountToGain);
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
