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
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';

export const replenishEnergy: SpellBlueprint = {
  id: 'replenish-energy',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Replenish Energy',
  description: dedent`
  You can only play this card if your Hero is @Empowered@.
  Select up to 2 cards in your Destiny Zone and add them to your hand.
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
  destinyCost: 1,
  speed: CARD_SPEED.BURST,
  abilities: [],
  canPlay: (game, card) => card.player.hero.modifiers.has(EmpowerModifier),
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const selectedCards = await game.interaction.chooseCards({
      player: card.player,
      label: 'Select up to 2 cards in your Destiny Zone to add to your hand',
      minChoiceCount: 0,
      maxChoiceCount: 2,
      choices: Array.from(card.player.cardManager.destinyZone),
      timeoutFallback: []
    });

    for (const selectedCard of selectedCards) {
      await selectedCard.addToHand();
    }
  }
};
