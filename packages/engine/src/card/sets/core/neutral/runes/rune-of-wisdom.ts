import type { RuneBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  defaultCardTint,
  RARITIES,
  RUNES
} from '../../../../card.enums';

export const runeOfWisdom: RuneBlueprint = {
  id: 'rune_of_wisdom',
  name: 'Rune of Wisdom',
  description: 'While this is in the Rune Zone, gain 1 Wisdom Rune.',
  collectable: true,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.RUNE,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.RUNE_DECK,
  art: defaultCardArt('placeholder', defaultCardTint),
  runeProduction: [RUNES.WISDOM.id],
  abilities: [],
  aiHints: {},
  jobs: [],
  tags: [],
  async onInit(game, card) {},
  async onPlay(game, card) {}
};
