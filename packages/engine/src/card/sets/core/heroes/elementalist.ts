import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const elementalist: HeroBlueprint = {
  id: 'elementalist',
  name: 'Elementalist',
  level: 2,
  destinyCost: 2,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.FIRE, AFFINITIES.STORM, AFFINITIES.FROST],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  cardIconId: 'elementalist',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  maxHp: 21,
  description: '',
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay() {}
};
