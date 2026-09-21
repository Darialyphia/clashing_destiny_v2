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
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';

export const songweaver: MinionBlueprint = {
  id: 'songweaver',
  name: 'Songweaver',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> <rt-keyword>Empower</rt-keyword> or <rt-keyword>Disempower</rt-keyword> a minion.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/songweaver'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 2,
  maxHp: 4,
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
            label: 'Select a minion to empower or disempower',
            timeoutFallback: singleMinionTargetRules.defaultTimeoutFallback(game, card),
            aiHints: {
              shouldPick: () => 1
            }
          });

          if (targetResult.cancelled) return;
          const target = targetResult.result.cards[0];
          if (!target) return;
          if (target.modifiers.has(EmpoweredModifier)) {
            await target.modifiers.remove(EmpoweredModifier);
          } else {
            await target.modifiers.add(new EmpoweredModifier(game, target));
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
