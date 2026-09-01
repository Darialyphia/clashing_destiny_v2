import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import { anywhereTargetRules, defaultCardArt } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';

export const conjureWisdom: SpellBlueprint = {
  id: 'conjureWisdom',
  name: 'Conjure Wisdom',
  description: dedent /*html*/ `
  <rt-keyword>Instant</rt-keyword>
  Discard a card to gain 1 <rt-runes runes="wisdom"></rt-runes>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('spells/conjure-wisdom'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.NEUTRAL],
  manaCost: 1,
  manaSupply: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  canPlay: (game, card) => card.player.cardManager.hand.length > 0,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit(game, card) {
    await card.modifiers.add(new InstantModifier(game, card));
  },
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 1
  }
};
