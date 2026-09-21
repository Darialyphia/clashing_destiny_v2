import dedent from 'dedent';
import type { SpellBlueprint } from '../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt, isSpell } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';

export const manaVortex: SpellBlueprint = {
  id: 'manaVortex',
  name: 'Mana Vortex',
  description: dedent /*html*/ `
  Draw a card. Reduce the cost of spells in your hand by 1, to a minimum of 1.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/mana-vortex'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.cardManager.draw(1);
    const spellsInHand = card.player.cardManager.hand.filter(isSpell);
    for (const spell of spellsInHand) {
      await spell.modifiers.add(
        new SimpleManacostModifier('mana-vortex-discount', game, card, {
          amount: -1,
          minimumCost: 1
        })
      );
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
