import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const sage: HeroBlueprint = {
  id: 'sage',
  name: 'Sage',
  level: 3,
  destinyCost: 3,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.COSMIC, AFFINITIES.ARCANE, AFFINITIES.CHRONO],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  cardIconId: 'sage',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 24,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
