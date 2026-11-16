import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';
import { FACTION_IDS } from '../../../factions/factions';

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
  manaCost: 4,
  manaSupply: 2,
  level: 1,
  exp: 1,
  factionId: FACTION_IDS.VETRUVIAN,
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
