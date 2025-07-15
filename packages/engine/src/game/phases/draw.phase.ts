import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    await this.game.gamePhaseSystem.currentPlayer.cardManager.draw(
      this.game.gamePhaseSystem.currentPlayer.cardsDrawnForTurn
    );

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAW_FOR_TURN);
  }

  private async recollect() {
    const cards = [...this.game.gamePhaseSystem.currentPlayer.cardManager.destinyZone];

    for (const card of cards) {
      await card.removeFromCurrentLocation();
      await card.player.cardManager.addToHand(card);
    }
  }

  async onEnter() {
    await this.drawForTurn();
    await this.recollect();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
