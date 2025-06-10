import { GAME_EVENTS } from '../../../../game/game.events';
import type { HeroBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';

export const mage: HeroBlueprint = {
  id: 'mage',
  name: 'Mage',
  description: 'Every three spell you play, draw a card.',
  level: 1,
  destinyCost: 1,
  kind: CARD_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  unlockableAffinities: [AFFINITIES.FIRE, AFFINITIES.FROST, AFFINITIES.ARCANE],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.BASIC,
  cardIconId: 'mage',
  collectable: true,
  unique: false,
  lineage: null,
  spellPower: 0,
  atk: 0,
  maxHp: 18,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    let count = 0;
    game.on(GAME_EVENTS.CARD_AFTER_PLAY, async event => {
      if (
        !event.data.card.equals(card.player) ||
        event.data.card.kind !== CARD_KINDS.SPELL
      ) {
        return;
      }

      count++;
      if (count % 3 === 0) {
        await card.player.cardManager.draw(1);
      }
    });
  }
};
