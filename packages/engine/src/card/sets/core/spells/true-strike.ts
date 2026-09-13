import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  isArtifact,
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
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';

export const trueStrike: SpellBlueprint<MinionCard> = {
  id: 'trueStrike',
  name: 'True Strike',
  description: dedent /*html*/ `
  Deal 1 damage to an enemy minion If you have an <rt-keyword>Equipped</rt-keyword> artifact, this deals 2 damage instead.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/true-strike'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.COMMON,
  affinities: [AFFINITIES.LIGHT],
  manaCost: 1,
  manaSupply: 2,
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
    const damageToDeal =
      card.player.boardSide
        .getAllCardsInPlay()
        .filter(isArtifact)
        .filter(artifact => artifact.modifiers.has(EquippedModifier)).length > 0
        ? 2
        : 1;
    await target.takeDamage(card, new SpellDamage(damageToDeal, card));
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
