import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LingeringDestinyModifier } from '../../../../../modifier/modifiers/lingering-destiny.modifier';

export const reviseTheStrategy: SpellBlueprint = {
  id: 'revise-the-strategy',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Revise the Strategy',
  description: dedent`
    Select up to 3 cards from your deck and remove them from play. Draw a card in your Destiny zone.
    
    @Lingering Destiny@.
  `,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.RARE,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
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
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
  },
  async onPlay(game, card) {
    const cardsInDeck = card.player.cardManager.mainDeck.cards;

    if (cardsInDeck.length === 0) {
      await card.player.cardManager.drawIntoDestinyZone(1);
      return;
    }

    const maxChoices = Math.min(3, cardsInDeck.length);

    const selectedCards = await game.interaction.chooseCards({
      player: card.player,
      label: 'Select up to 3 cards from your deck to remove from play.',
      minChoiceCount: 0,
      maxChoiceCount: maxChoices,
      choices: cardsInDeck,
      timeoutFallback: []
    });

    for (const selectedCard of selectedCards) {
      selectedCard.removeFromCurrentLocation();
    }

    await card.player.cardManager.drawIntoDestinyZone(1);
  }
};
