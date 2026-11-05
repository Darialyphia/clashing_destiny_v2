import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const timeMaelstrom: SpellBlueprint = {
  id: 'time-maelstrom',
  name: 'Time Maelstrom',
  description: dedent /*html*/ `
  End the turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/time-maelstrom'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.AIR],
  manaCost: 4,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) =>
    anywhereTargetRules.getTargets({ game, card, canCancel: true }),
  async onInit() {},
  async onPlay(game) {
    await game.gamePhaseSystem.endTurn();
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
