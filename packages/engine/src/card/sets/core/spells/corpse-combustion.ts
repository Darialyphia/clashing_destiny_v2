import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  singleEnemyMinionTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';

export const corpseCombustion: SpellBlueprint<MinionCard> = {
  id: 'corpseCombustion',
  name: 'Corpse Combustion',
  description: dedent /*html*/ `
  Destroy a unit with <rt-keyword>Burn</rt-keyword>. Inflict <rt-keyword>Burn 1</rt-keyword> to adjacent enemies.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/corpse-combustion'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR],
  manaCost: 5,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, minion =>
      minion.modifiers.has(BurnModifier)
    ),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.modifiers.has(BurnModifier),
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    const adjacent = target.position?.adjacentCards?.filter(isMinion) ?? [];
    await target.destroy(card);

    for (const adj of adjacent) {
      await adj.modifiers.add(
        new BurnModifier(game, card, {
          stacks: 1
        })
      );
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
