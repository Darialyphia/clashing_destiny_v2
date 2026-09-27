import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isMinion } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';

export const decimate: SpellBlueprint = {
  id: 'decimate',
  name: 'Decimate',
  description: dedent /*html*/ `
  Deal damage to all minions at a battlefield equal to your highest battlefield influence.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/decimate'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 7,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) =>
    anywhereTargetRules.getTargets({ game, card, canCancel: true }),
  async onInit() {},
  async onPlay(game, card) {
    const damageToDeal = Math.max(
      card.player.boardSide.leftBattlefield.commandmentScore,
      card.player.boardSide.rightBattlefield.commandmentScore
    );

    const targets = game.cardSystem.cards
      .filter(isMinion)
      .filter(minion => minion.isOnBattlefield);

    for (const target of targets) {
      await target.takeDamage(card, new SpellDamage(damageToDeal, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
