import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class EndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {}

  async scoreLeftBattlefield() {
    const p1Score =
      this.game.playerSystem.player1.boardSide.leftBattlefield.commandmentScore;
    const p2Score =
      this.game.playerSystem.player2.boardSide.leftBattlefield.commandmentScore;
    if (p1Score > p2Score) {
      await this.game.playerSystem.player1.gainVictoryPoints(1);
    } else if (p2Score > p1Score) {
      await this.game.playerSystem.player2.gainVictoryPoints(1);
    }
  }

  async scoreRightBattlefield() {
    const p1Score =
      this.game.playerSystem.player1.boardSide.rightBattlefield.commandmentScore;
    const p2Score =
      this.game.playerSystem.player2.boardSide.rightBattlefield.commandmentScore;
    if (p1Score > p2Score) {
      await this.game.playerSystem.player1.gainVictoryPoints(1);
    } else if (p2Score > p1Score) {
      await this.game.playerSystem.player2.gainVictoryPoints(1);
    }
  }

  async scoreBattlefields() {
    await this.scoreLeftBattlefield();
    await this.scoreRightBattlefield();
  }

  async terminateTurn() {
    await this.game.turnSystem.endTurn();
    await this.game.gamePhaseSystem.startTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
