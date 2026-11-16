import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isMinion } from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import { SpellDamage } from '../../../../utils/damage';
import { FACTION_IDS } from '../../../factions/factions';

export const decimate: SpellBlueprint = {
  id: 'decimate',
  name: 'Decimate',
  description: dedent /*html*/ `
  Deal damage to all minions at a battlefield equal to the sum of your influence on both battlefields.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/decimate'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.LEGENDARY,
  manaCost: 4,
  manaSupply: 2,
  level: 4,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) =>
    anywhereTargetRules.getTargets({ game, card, canCancel: true }),
  async onInit() {},
  async onPlay(game, card) {
    const damageToDeal =
      card.player.boardSide.leftBattlefield.commandmentScore +
      card.player.boardSide.rightBattlefield.commandmentScore;

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
