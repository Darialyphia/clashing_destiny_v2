import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const fireAffinity: DestinyBlueprint = {
  id: 'fire-affinity',
  name: 'Fire Affinity',
  cardIconId: 'talent-fire-affinity',
  description: '@Basic Affinity@.\nAllows you to play Fire cards.',
  collectable: true,
  unique: false,
  destinyCost: 0,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 0,
  async onInit() {},
  async onPlay(game, card) {
    await card.player.unlockAffinity(AFFINITIES.FIRE);
  }
};
