import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const fearlessLeader: DestinyBlueprint = {
  id: 'fearless-leader',
  name: 'Fearless Leader',
  cardIconId: 'talent-fearless-leader',
  description:
    'Give your hero @On Attack@ : give +1 @[attack]@ to your minions in the Attack zone this turn.',
  collectable: true,
  unique: false,
  destinyCost: 1,
  affinity: AFFINITIES.NORMAL,
  kind: CARD_KINDS.DESTINY,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  minLevel: 3,
  abilities: [],
  async onInit(game, card) {},
  async onPlay(game, card) {}
};
