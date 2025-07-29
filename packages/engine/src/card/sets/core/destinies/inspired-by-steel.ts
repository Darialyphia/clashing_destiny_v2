import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const inspiredBySteel: DestinyBlueprint = {
  id: 'inspired-by-steel',
  name: 'Inspired by Steel',
  cardIconId: 'talent-inspired-by-steel',
  description:
    '@Lineage Bonus(Knight)@ : When you play a Weapon Artifact, gain +1 Attack this turn.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  async onInit() {},
  async onPlay(game, card) {}
};
