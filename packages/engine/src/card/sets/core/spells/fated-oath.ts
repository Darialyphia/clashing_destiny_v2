import type { SpellBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';

export const fatedOath: SpellBlueprint = {
  id: 'fated-oath',
  name: 'Fated Oath',
  cardIconId: 'spells/fated-oath',
  description:
    '@[level] 1+ bonus@: Search your deck for a card and banish it. At the end of your next turn, add it to your Destiny Deck as a Destiny Card that costs @[destiny] 1@.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.FLASH,
  spellSchool: null,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card, targets) {}
};
