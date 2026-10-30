import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const tutorialSunstoneTemplar: MinionBlueprint = {
  id: 'tutorial-sunstone-templar',
  name: 'Sunstone Templar',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> Deal 1 damage to an enemy minion.
  `,
  collectable: false,
  setId: CARD_SETS.TUTORIAL,
  art: defaultCardArt('minions/sunstone-templar'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.TOKEN,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 3,
  commandment: 2,
  affinities: [AFFINITIES.LIGHT],
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          if (!singleEnemyMinionTargetRules.canPlay(game, card)) return;

          const targetResult = await singleEnemyMinionTargetRules.getTargets({
            game,
            card,
            label: 'Select an enemy minion to damage',
            timeoutFallback: singleEnemyMinionTargetRules.defaultTimeoutFallback(
              game,
              card,
              () => true
            ),
            aiHints: {
              shouldPick: () => 1
            }
          });
          if (targetResult.cancelled) return;

          const [target] = targetResult.result.cards;
          if (!target) return;

          await target.takeDamage(card, new AbilityDamage(1));
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
