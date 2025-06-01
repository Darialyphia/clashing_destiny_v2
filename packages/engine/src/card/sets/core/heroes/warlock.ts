import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const warlock: HeroBlueprint = {
  id: 'warlock',
  name: 'Warlock',
  level: 3,
  destinyCost: 3,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [
    AFFINITIES.BLOOD,
    AFFINITIES.CHAOS,
    AFFINITIES.FIRE,
    AFFINITIES.SHADOW
  ],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  cardIconId: 'warlock',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  maxHp: 24,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  async onInit() {},
  async onPlay() {}
};
