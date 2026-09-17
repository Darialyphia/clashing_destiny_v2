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
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellDamage } from '../../../../utils/damage';

export const tempest: SpellBlueprint = {
  id: 'tempest',
  name: 'Tempest',
  description: dedent /*html*/ `
  Deal 2 damage to all minions.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/tempest'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 3,
  manaSupply: 2,
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
      await target.takeDamage(card, new SpellDamage(2, card));
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
