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
  description:
    'Allows you to play Arcane cards. Costs @[mana] 1@ more for each affinity you have unlocked.',
  collectable: true,
  unique: false,
  destinyCost: 0,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 1,
  countsAsLevel: true,
  abilities: [],
  async onInit(game, card) {
    await card.addInterceptor(
      'destinyCost',
      value =>
        value! +
        card.player.unlockedAffinities.filter(a => a !== AFFINITIES.NORMAL).length
    );
  },
  async onPlay(game, card) {
    await card.player.unlockAffinity(AFFINITIES.ARCANE);
  }
};
