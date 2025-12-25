import { GAME_EVENTS } from '../../../../../game/game.events';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES,
  CARD_LOCATIONS
} from '../../../../card.enums';

export const quirkyBookworm: MinionBlueprint = {
  id: 'quirky-bookworm',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Quirky Bookworm',
  description: '',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 1,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [
    {
      id: 'quirky-bookworm-ability',
      description: 'todo',
      label: 'todo',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      async onResolve(game, card) {
        //
      }
    }
  ],
  async onInit() {},
  async onPlay() {}
};
