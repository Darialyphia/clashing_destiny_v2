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
import { GAME_EVENTS } from '../../../../../game/game.events';

export const manaSpark: SpellBlueprint = {
  id: 'mana-spark',
  kind: CARD_KINDS.SPELL,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Spark',
  description: dedent`
  Cannot be played. Banish this card at the end of the turn.
`,
  faction: FACTIONS.NEUTRAL,
  rarity: RARITIES.TOKEN,
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
      tint: FACTIONS.NEUTRAL.defaultCardTint
    }
  },
  manaCost: 0,
  abilities: [],
  canPlay: () => false,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    game.on(GAME_EVENTS.TURN_END, async () => {
      await card.sendToBanishPile();
    });
  },
  async onPlay() {}
};
