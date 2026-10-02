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
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';

export const circleOfLife: SpellBlueprint<MinionCard> = {
  id: 'circleOfLife',
  name: 'Circle of Life',
  description: dedent /*html*/ `
  Deal 3 damage to an enemy minion at a battlefield. Gain 3 influence on that battlefield.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/circle-of-life'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.EPIC,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  canPlay: (game, card) =>
    singleEnemyMinionTargetRules.canPlay(
      game,
      card,
      minion => minion.isEnemy(card) && minion.isOnBattlefield
    ),
  getTargets: (game, card) =>
    singleEnemyMinionTargetRules.getTargets({
      game,
      card,
      timeoutFallback: singleEnemyTargetRules.defaultTimeoutFallback(game, card),
      canCancel: true,
      predicate: minion => minion.isEnemy(card) && minion.isOnBattlefield,
      aiHints: {
        shouldPick: () => 1
      }
    }),
  async onInit() {},
  async onPlay(game, card, targets) {
    const [target] = targets.cards;
    if (!target) return;

    const battlefield = target.battlefield!.opponentBattlefield;

    await target.takeDamage(card, new SpellDamage(3, card));
    await battlefield.gainScore(3);
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
