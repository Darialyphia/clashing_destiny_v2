import type { EmptyObject, Serializable } from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import { GAME_PHASE_TRANSITIONS } from '../game.enums';

export class DrawPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  private async drawForTurn() {
    for (const player of this.game.playerSystem.players) {
      await player.cardManager.draw(player.cardsDrawnForTurn);
    }
  }

  private async refillMana() {
    for (const player of this.game.playerSystem.players) {
      await player.manaManager.refill();
    }
  }

  async onEnter() {
    if (this.game.turnSystem.elapsedTurns > 0) {
      await this.game.turnSystem.startTurn();
    }
    await this.drawForTurn();
    await this.refillMana();

    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.DRAWN_FOR_TURN);
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
