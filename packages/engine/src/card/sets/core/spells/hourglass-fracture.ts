import dedent from 'dedent';
import { GAME_PHASES } from '../../../../game/game.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';

export const hourglassFracture: SpellBlueprint = {
  id: 'hourglass-fracture',
  name: 'Hourglass Fracture',
  cardIconId: 'spell-hourglass-fracture',
  description: dedent`
  Your opponent ends their next turn after their Destiny Phase. Banish all cards in your Destiny zone.
  `,
  collectable: true,
  manaCost: 5,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    const stop = game.on(GAME_EVENTS.AFTER_CHANGE_PHASE, async event => {
      if (game.gamePhaseSystem.currentPlayer.equals(card.player)) return;

      // if (event.data.from === GAME_PHASES.DESTINY) {
      //   stop();
      //   await game.gamePhaseSystem.declareEndPhase();
      // }
    });

    for (const destinyCard of card.player.cardManager.destinyZone) {
      destinyCard.removeFromCurrentLocation();
      destinyCard.sendToBanishPile();
    }
  }
};
