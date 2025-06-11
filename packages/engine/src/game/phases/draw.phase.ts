import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    const isFirstTurn = this.game.gamePhaseSystem.elapsedTurns === 0;

    await this.game.gamePhaseSystem.turnPlayer.cardManager.draw(
      this.game.gamePhaseSystem.turnPlayer.cardsDrawnForTurn
    );
    if (isFirstTurn) {
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.DRAW_FOR_DIRST_TURN
      );
    } else {
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.DRAW_FOR_TURN
      );
    }
  }

  async onEnter() {
    await this.drawForTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
