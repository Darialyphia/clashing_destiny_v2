import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    const isFirstTurn = this.game.gamePhaseSystem.elapsedTurns === 0;

    if (isFirstTurn) {
      await this.game.gamePhaseSystem.turnPlayer.cardManager.draw(
        this.game.gamePhaseSystem.turnPlayer.isPlayer1
          ? this.game.config.PLAYER_1_CARDS_DRAWN_ON_FIRST_TURN
          : this.game.config.PLAYER_2_CARDS_DRAWN_ON_FIRST_TURN
      );
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.DRAW_FOR_DIRST_TURN
      );
    } else {
      await this.game.gamePhaseSystem.turnPlayer.cardManager.draw(
        this.game.config.CARDS_DRAWN_PER_TURN
      );
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
