import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const sorcerer: HeroBlueprint = {
  id: 'sorcerer',
  name: 'Sorcerer',
  level: 2,
  destinyCost: 2,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.ARCANE, AFFINITIES.WIND, AFFINITIES.EARTH],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  cardIconId: 'sorcerer',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 21,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
