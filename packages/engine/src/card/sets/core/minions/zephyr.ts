import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  singleAllyMinionTargetRules,
  singleMinionTargetRules
} from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  CARD_SPEED,
  AFFINITIES
} from '../../../card.enums';
import { EmpoweredModifier } from '../../../../modifier/modifiers/empowered.modifier';
import { ChannelModifier } from '../../../../modifier/modifiers/channel.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';

export const zephyr: MinionBlueprint = {
  id: 'zephyr',
  name: 'Zephyr',
  description: dedent /*html*/ `
  <rt-keyword>Channel</rt-keyword>: <rt-keyword>Empower me<rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('minions/zephyr'),
  kind: CARD_KINDS.MINION,
  rarity: RARITIES.COMMON,
  manaCost: 3,
  manaSupply: 3,
  speed: CARD_SPEED.SLOW,
  tags: [],
  atk: 3,
  maxHp: 3,
  affinities: [AFFINITIES.AIR, AFFINITIES.NEUTRAL],
  commandment: 2,
  canPlay: () => true,
  abilities: [
    {
      id: 'zephyr-ability',
      label: 'Move me a,d debuff enemies',
      description:
        '<rt-keyword>Disempower</rt-keyword> me. Swap my position with an ally minion at a battlefield, then give enemies at this battlefield -1/-1/-1.',
      manaCost: 1,
      canUse: (game, card) =>
        card.modifiers.has(EmpoweredModifier) &&
        singleAllyMinionTargetRules.canPlay(
          game,
          card,
          minion => !minion.equals(card) && minion.canMove && minion.isOnBattlefield
        ),
      getTargets: (game, card) =>
        singleAllyMinionTargetRules.getTargets({
          game,
          card,
          predicate: minion =>
            minion.equals(card) && minion.canMove && minion.isOnBattlefield,
          aiHints: {
            shouldPick: () => 1
          },
          timeoutFallback: []
        }),
      async onResolve(game, card, targets) {
        const target = targets.cards[0] as MinionCard;
        if (!target) return;

        await card.modifiers.remove(EmpoweredModifier);

        const enemies = card.player.enemyMinions.filter(
          minion => minion.location === card.location
        );

        for (const enemy of enemies) {
          await enemy.modifiers.add(
            new SimpleStatsBuffModifier('zephyr-debuff', game, card, {
              atk: -1,
              cmd: -1,
              hp: -1
            })
          );
        }
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  async onInit(game, card) {
    await card.modifiers.add(
      new ChannelModifier('zephyr-channel', game, card, {
        async handler() {
          if (card.modifiers.has(EmpoweredModifier)) return;
          await card.modifiers.add(new EmpoweredModifier(game, card));
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
