import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const heraldOfSalvation: MinionBlueprint = {
  id: 'herald-of-salvation',
  name: 'Herald of Salvation',
  cardIconId: 'unit-herald-of-salvation',
  description: `The next time a allied minion is destroyed, send it to your Destiny zone instead of the discard pile.\n@[level] 5+@ : +1 @[attack]@`,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 1,
  maxHp: 3,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {}
};
