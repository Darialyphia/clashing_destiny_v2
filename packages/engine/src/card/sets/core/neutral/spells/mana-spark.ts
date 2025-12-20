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
import { GAME_EVENTS } from '../../../../../game/game.events';
import { CARD_LOCATIONS } from '../../../../components/card-manager.component';

export const manaSpark: SpellBlueprint = {
  id: 'mana-spark',
  kind: CARD_KINDS.SPELL,
  collectable: false,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mana Spark',
  description: dedent`
  Cannot be played.
  If this card is in your Destiny Zone at the end of the turn, banish it.
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
  runeCost: {},
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => false,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    game.on(GAME_EVENTS.TURN_END, () => {
      if (card.location === CARD_LOCATIONS.DESTINY_ZONE) {
        card.sendToBanishPile();
      }
    });
  },
  async onPlay() {}
};
