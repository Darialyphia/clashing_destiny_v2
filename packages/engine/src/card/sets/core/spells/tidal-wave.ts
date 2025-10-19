import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const tidalWave: SpellBlueprint = {
  id: 'tidal-wave',
  name: 'Tidal Wave',
  cardIconId: 'spells/tidal-wave',
  description: "Put all minions in their owner's Destiny Zone.",
  collectable: true,
  unique: false,
  manaCost: 5,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game) {
    const minions = game.boardSystem.getAllCardsInPlay().filter(isMinion);

    for (const minion of minions) {
      minion.sendToDestinyZone();
    }
  }
};
