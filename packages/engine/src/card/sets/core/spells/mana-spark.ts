import { GAME_EVENTS } from '../../../../game/game.events';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const manaSpark: SpellBlueprint = {
  id: 'mana-spark',
  name: 'Mana Spark',
  cardIconId: 'spells/mana-spark',
  description: 'If this card is in your Destiny zone at the end of the turn, banish it.',
  collectable: false,
  unique: false,
  manaCost: 0,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    game.on(GAME_EVENTS.TURN_END, () => {
      if (card.location === 'destinyZone') {
        card.sendToBanishPile();
      }
    });
  },
  async onPlay() {}
};
