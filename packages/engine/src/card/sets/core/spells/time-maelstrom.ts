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
import { SpellDamage } from '../../../../utils/damage';
import { EphemeralModifier } from '../../../../modifier/modifiers/ephemeral.modifier';
import { askMandatoryYesNoQuestion } from '../../../card-actions-utils';

export const timeMaelstrom: SpellBlueprint = {
  id: 'time-maelstrom',
  name: 'Time Maelstrom',
  description: dedent /*html*/ `
  Give all minions <rt-keyword>Ephemeral</rt-keyword>. Then you may pay <rt-mana>3</rt-mana> to end the turn.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/time-maelstrom'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  affinities: [AFFINITIES.AIR, AFFINITIES.AIR, AFFINITIES.AIR],
  manaCost: 5,
  manaSupply: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) =>
    anywhereTargetRules.getTargets({ game, card, canCancel: true }),
  async onInit() {},
  async onPlay(game, card) {
    const targets = [...card.player.minions, ...card.player.opponent.minions];

    for (const target of targets) {
      await target.modifiers.add(new EphemeralModifier(game, card));
    }

    const canPay = card.player.mana >= 3;
    if (!canPay) return;

    const shouldEndturn = await askMandatoryYesNoQuestion({
      game,
      card,
      label: 'Pay 3 mana to end the turn?',
      questionId: 'time-maelstrom',
      aiChoice: 'yes',
      timeoutFallback: 'no'
    });
    if (shouldEndturn) {
      await card.player.spendMana(3);
      await game.gamePhaseSystem.endTurn();
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
