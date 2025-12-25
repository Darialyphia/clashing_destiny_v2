import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { LoyaltyModifier } from '../../../../../modifier/modifiers/loyalty.modifier';
import { GAME_EVENTS } from '../../../../../game/game.events';

export const thirstForKnowledge: SpellBlueprint = {
  id: 'thirst-for-knowledge',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Thirst for Knowledge',
  description: dedent`
    @Loyalty 2@.

    Draw 3 cards. Discard them at the end of the turn.
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
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LoyaltyModifier(game, card, { amount: 2 }));
  },
  async onPlay(game, card) {
    const cards = await card.player.cardManager.draw(3);
    for (const drawnCard of cards) {
      game.once(GAME_EVENTS.TURN_END, async () => {
        if (drawnCard.location === CARD_LOCATIONS.HAND) {
          await drawnCard.discard();
        }
      });
    }
  }
};
