import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Thirst for Knowledge',
  description: dedent`
    @Loyalty 2@, @Consume@ @[knowledge]@ @[knowledge]@ @[knowledge]@.

    Draw 3 cards.
`,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 3,
  runeCost: {
    KNOWLEDGE: 3
  },
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, { amount: 2 }));
  },
  async onPlay(game, card) {
    if (card.isPlayedFromHand) {
      await card.player.spendRune({ KNOWLEDGE: 3 });
    }
    await card.player.cardManager.draw(3);
  }
};
