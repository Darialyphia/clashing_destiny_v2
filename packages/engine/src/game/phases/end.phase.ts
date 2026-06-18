import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { EmptyObject, Serializable } from '@game/shared';

export class EndPhase implements GamePhaseController, Serializable<EmptyObject> {
  constructor(private game: Game) {}

  async onEnter() {}

  async scoreBattlefields() {
    // check who has the highest score on each battlefield and award victory points to the winner
    const leftBattleFieldWinners = this.game.playerSystem.players.reduce(
      (winners, player) => {
        const winnerScore = winners[0].boardSide.leftBattlefield.commandmentScore;
        const playerScore = player.boardSide.leftBattlefield.commandmentScore;
        if (playerScore > winnerScore) {
          return [player];
        } else if (playerScore === winnerScore) {
          return [...winners, player];
        }
        return winners;
      },
      [this.game.playerSystem.players[0]]
    );

    const rightBattleFieldWinners = this.game.playerSystem.players.reduce(
      (winners, player) => {
        const winnerScore = winners[0].boardSide.rightBattlefield.commandmentScore;
        const playerScore = player.boardSide.rightBattlefield.commandmentScore;
        if (playerScore > winnerScore) {
          return [player];
        } else if (playerScore === winnerScore) {
          return [...winners, player];
        }
        return winners;
      },
      [this.game.playerSystem.players[0]]
    );

    if (leftBattleFieldWinners.length === 1) {
      await leftBattleFieldWinners[0].gainVictoryPoints(1);
    }

    if (rightBattleFieldWinners.length === 1) {
      await rightBattleFieldWinners[0].gainVictoryPoints(1);
    }
  }

  async terminateTurn() {
    await this.game.turnSystem.endTurn();
    await this.game.turnSystem.startTurn();
    await this.game.gamePhaseSystem.startTurn();
  }

  async onExit() {}

  serialize(): EmptyObject {
    return {};
  }
}
