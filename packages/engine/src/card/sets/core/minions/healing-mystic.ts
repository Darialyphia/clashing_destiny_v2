import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleMinionTargetRules } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';

export const healingMystic: MinionBlueprint = {
  id: 'healing-mystic',
  name: 'Healing Mystic',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> You may heal a minion for 2.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/healing-mystic'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 2,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 3,
  commandment: 2,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const hasTarget = singleMinionTargetRules.canPlay(game, card);
          if (!hasTarget) return;

          const targetResult = await singleMinionTargetRules.getTargets({
            game,
            card,
            canCancel: true,
            label: 'Select a minion to heal',
            timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(
              game,
              card,
              m => m.isAlly(card)
            ),
            aiHints: {
              shouldPick: () => 1
            }
          });
          if (targetResult.cancelled) return;
          const target = targetResult.result.cards[0];
          if (target) {
            await target.heal(2);
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
