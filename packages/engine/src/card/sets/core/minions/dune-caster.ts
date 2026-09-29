import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../card-utils';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { windDervish } from './wind-dervish';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';

export const duneCaster: MinionBlueprint = {
  id: 'dune-caster',
  name: 'Dune Caster',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger>: Give an ally <rt-card>Wind Dervish</rt-card> +0/+1/+1 and remove <rt-keyword>Ephemeral</rt-keyword> from it.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/dune-caster'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 2,
  manaSupply: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 2,
  affinities: [AFFINITIES.AIR],
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasTarget = singleAllyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.blueprintId === windDervish.id
          );
          if (!hasTarget) return;

          const targetResult = await singleAllyMinionTargetRules.getTargets({
            game,
            card,
            timeoutFallback: [],
            canCancel: true,
            label: 'Select an ally Wind Dervish',
            predicate(c) {
              return c.blueprintId === windDervish.id;
            },
            aiHints: {
              shouldPick: () => 1
            }
          });

          if (targetResult.cancelled) return;
          const target = targetResult.result.cards[0];
          if (!target) return;
          await target.modifiers.add(
            new SimpleStatsBuffModifier('dune-caster-buff', game, card, {
              atk: 1,
              cmd: 0,
              hp: 1
            })
          );
          await target.modifiers.remove(EphemeralModifier);
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
