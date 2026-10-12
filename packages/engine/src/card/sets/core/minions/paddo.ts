import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES,
  CARD_LOCATIONS
} from '../../../card.enums';
import { IntimidateModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { OnScoreModifier } from '../../../../modifier/modifiers/on-score.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const paddo: MinionBlueprint = {
  id: 'paddo',
  name: 'Paddo',
  description: dedent /*html*/ `
  <rt-keyword>Intimidate 2</rt-keyword>.
  <rt-trigger>On Score</rt-trigger> Deal 4 damage to an enemy minion in base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/paddo'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.LEGENDARY,
  affinities: [
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL,
    AFFINITIES.NEUTRAL
  ],
  manaCost: 6,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 4,
  maxHp: 7,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new IntimidateModifier(game, card, { level: 2 }));
    await card.modifiers.add(
      new OnScoreModifier(game, card, {
        async handler() {
          const hasTarget = singleEnemyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === CARD_LOCATIONS.BASE
          );
          if (!hasTarget) return;

          const targetResult = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            label: 'Select an enemy minion to deal 4 damage to',
            predicate: minion => minion.location === CARD_LOCATIONS.BASE,
            canCancel: false,
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            }
          });

          if (targetResult.cancelled) return;

          const target = targetResult.result.cards[0];
          if (!target) return;
          await target.takeDamage(card, new AbilityDamage(4));
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
