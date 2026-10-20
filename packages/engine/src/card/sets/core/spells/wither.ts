import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import {
  defaultCardArt,
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

export const wither: SpellBlueprint<MinionCard> = {
  id: 'wither',
  name: 'Wither',
  description: dedent /*html*/ `
  Give a minion at a battlefield <rt-keyword>Ephemeral</rt-keyword>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/wither'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.NEUTRAL],
  manaCost: 3,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(game, card, minion => minion.isOnBattlefield),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    await target.modifiers.add(new EphemeralModifier(game, target));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
