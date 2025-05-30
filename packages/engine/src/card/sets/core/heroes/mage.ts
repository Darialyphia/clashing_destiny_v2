import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const mage: HeroBlueprint = {
  id: 'mage',
  name: 'Mage',
  level: 1,
  destinyCost: 1,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.FIRE, AFFINITIES.FROST, AFFINITIES.ARCANE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.BASIC,
  cardIconId: 'mage',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  maxHp: 18,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  async onInit() {},
  async onPlay() {}
};
