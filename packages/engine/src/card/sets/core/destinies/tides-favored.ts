import dedent from 'dedent';
import type { DestinyBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import { TidesFavoredModifier } from '../../../../modifier/modifiers/tide-modifier';

export const tidesFavored: DestinyBlueprint = {
  id: 'tides-favored',
  name: "Tide's Favored",
  cardIconId: 'talent-tides-favor',
  description: dedent`
  Your Hero now controls the @Tide@.
  
  This comes into play at the start of the game (it does not count towards your Hero's level).
  `,
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
  countsAsLevel: false,
  abilities: [],
  async onInit(game, card) {
    await game.once(GAME_EVENTS.READY, async () => {
      await card.player.playDestinyCard(card);
    });
  },
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(new TidesFavoredModifier(game, card));
  }
};
