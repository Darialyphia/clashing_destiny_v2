import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, singleAllyMinionTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { SimpleHealthBuffModifier } from '../../../../../modifier/modifiers/simple-health-buff.modifier';

export const loamkinTender: MinionBlueprint = {
  id: 'loamkinTender',
  name: 'Loamkin Tender',
  description: dedent /*html*/ `
  <rt-trigger>On Enter</rt-trigger> Give another ally minion in base +0/+0/+1.
  <rt-runes runes="focus,focus"></rt-runes> give it +0/+0/+2 instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.TAMER],
  affinities: [AFFINITIES.EARTH],
  manaCost: 1,
  runeCost: [],
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 1,
  maxHp: 1,
  commandment: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          const hasTarget = singleAllyMinionTargetRules.canPlay(
            game,
            card,
            minion => minion.location === CARD_LOCATIONS.BASE && !minion.equals(card)
          );
          if (!hasTarget) return;
          const targetResult = await singleAllyMinionTargetRules.getTargets({
            game,
            card,
            predicate: minion =>
              minion.location === CARD_LOCATIONS.BASE && !minion.equals(card),
            label: 'Select an ally minion to buff',
            timeoutFallback: [],
            aiHints: {
              shouldPick: () => 1
            }
          });

          if (targetResult.cancelled) return;

          const target = targetResult.result.cards[0];
          if (!target) return;

          await target.modifiers.add(
            new SimpleHealthBuffModifier('loamkin-tender-hp-buff', game, target, {
              amount: card.player.runeManager.has({ focus: 2 }) ? 2 : 1
            })
          );
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
