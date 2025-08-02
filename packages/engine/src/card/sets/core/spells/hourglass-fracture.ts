import { GAME_PHASES } from '../../../../game/game.enums';
import { GAME_EVENTS } from '../../../../game/game.events';
import type { PreResponseTarget, SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';

export const hourglassFracture: SpellBlueprint<PreResponseTarget> = {
  id: 'hourglass-fracture',
  name: 'Hourglass Fracture',
  cardIconId: 'hourglass-fracture',
  description: 'Your opponent ends their next turn after their Draw Phase.',
  collectable: true,
  unique: false,
  manaCost: 5,
  affinity: AFFINITIES.CHRONO,
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

      if (event.data.from === GAME_PHASES.MAIN) {
        stop();
        await game.gamePhaseSystem.endTurn();
      }
    });
  }
};
