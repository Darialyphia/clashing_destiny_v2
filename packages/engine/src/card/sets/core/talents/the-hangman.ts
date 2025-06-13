import type { TalentBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { novice } from '../heroes/novice';

export const theHangman: TalentBlueprint = {
  id: 'the-hangman',
  name: 'The Hangman',
  cardIconId: 'talent-the-hangman',
  description:
    '@On Enter@: Give your Hero: @[exhaust]@ @[mana] 4@: Switch the zone of all minions, then @Seal@ this ability.',
  affinity: AFFINITIES.NORMAL,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 2,
  heroId: novice.id,
  rarity: RARITIES.EPIC,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {}
};
