import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const novice: HeroBlueprint = {
  id: 'novice',
  name: 'Novice',
  level: 0,
  destinyCost: 0,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.BASIC,
  cardIconId: 'hero-novice',
  collectable: false,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 15,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
