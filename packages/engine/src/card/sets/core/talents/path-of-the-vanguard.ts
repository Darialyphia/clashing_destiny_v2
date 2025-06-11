import { GAME_EVENTS } from '../../../../game/game.events';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { TalentBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { novice } from '../heroes/novice';

export const pathOfTheVanguard: TalentBlueprint = {
  id: 'path-of-the-vanguard',
  name: 'Path of the Vanguard',
  cardIconId: 'path-of-the-vanguard',
  description: 'When your hero levels up, give +1@[health]@ to your minions.',
  affinity: AFFINITIES.NORMAL,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 0,
  heroId: novice.id,
  rarity: RARITIES.RARE,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    game.on(GAME_EVENTS.HERO_AFTER_LEVEL_UP, async event => {
      if (!event.data.card.equals(card.player.hero)) return;
      for (const minion of card.player.minions) {
        await minion.modifiers.add(
          new SimpleHealthBuffModifier('path-of-the-vanguard-health-buff', game, card, {
            amount: 1
          })
        );
      }
    });
  }
};
