import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import type { GamePhaseController } from './game-phase';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    await this.game.gamePhaseSystem.turnPlayer.cardManager.draw(
      this.game.gamePhaseSystem.turnPlayer.cardsDrawnForTurn
    );

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAW_FOR_TURN);
  }

  async onEnter() {
    await this.drawForTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
