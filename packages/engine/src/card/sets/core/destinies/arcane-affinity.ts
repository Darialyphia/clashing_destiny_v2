import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const arcaneAffinity: DestinyBlueprint = {
  id: 'arcane-affinity',
  name: 'Arcane Affinity',
  cardIconId: 'talent-arcane-affinity',
  description: '@Advanced Affinity@.\nAllows you to play Arcane cards.',
  collectable: true,
  unique: false,
  destinyCost: 2,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.unlockAffinity(AFFINITIES.WATER);
  }
};
