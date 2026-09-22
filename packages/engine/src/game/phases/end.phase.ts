import type { Battlefield } from '../../board/battlefield';
import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
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
      await this.game.emit(
        END_PHASE_EVENTS.BATTLEFIELD_SCORED,
        new BattleFieldscoredEvent({
          battledield: this.game.playerSystem.player1.boardSide.leftBattlefield,
          winner: { player: this.game.playerSystem.player1, score: p1Score },
          loser: { player: this.game.playerSystem.player2, score: p2Score }
        })
      );
      await this.game.playerSystem.player1.gainVictoryPoints(1);
    } else if (p2Score > p1Score) {
      await this.game.emit(
        END_PHASE_EVENTS.BATTLEFIELD_SCORED,
        new BattleFieldscoredEvent({
          battledield: this.game.playerSystem.player2.boardSide.leftBattlefield,
          winner: { player: this.game.playerSystem.player2, score: p2Score },
          loser: { player: this.game.playerSystem.player1, score: p1Score }
        })
      );
      await this.game.playerSystem.player2.gainVictoryPoints(1);
    }
  }

  async scoreRightBattlefield() {
    const p1Score =
      this.game.playerSystem.player1.boardSide.rightBattlefield.commandmentScore;
    const p2Score =
      this.game.playerSystem.player2.boardSide.rightBattlefield.commandmentScore;
    if (p1Score > p2Score) {
      await this.game.emit(
        END_PHASE_EVENTS.BATTLEFIELD_SCORED,
        new BattleFieldscoredEvent({
          battledield: this.game.playerSystem.player1.boardSide.rightBattlefield,
          winner: { player: this.game.playerSystem.player1, score: p1Score },
          loser: { player: this.game.playerSystem.player2, score: p2Score }
        })
      );
      await this.game.playerSystem.player1.gainVictoryPoints(1);
    } else if (p2Score > p1Score) {
      await this.game.emit(
        END_PHASE_EVENTS.BATTLEFIELD_SCORED,
        new BattleFieldscoredEvent({
          battledield: this.game.playerSystem.player2.boardSide.rightBattlefield,
          winner: { player: this.game.playerSystem.player2, score: p2Score },
          loser: { player: this.game.playerSystem.player1, score: p1Score }
        })
      );
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

export const END_PHASE_EVENTS = {
  BATTLEFIELD_SCORED: 'battlefield_scored'
} as const;

export class BattleFieldscoredEvent extends TypedSerializableEvent<
  {
    battledield: Battlefield;
    winner: { player: Player; score: number };
    loser: { player: Player; score: number };
  },
  {
    battledield: string;
    winner: { player: string; score: number };
    loser: { player: string; score: number };
  }
> {
  serialize() {
    return {
      battledield: this.data.battledield.id,
      winner: {
        player: this.data.winner.player.id,
        score: this.data.winner.score
      },
      loser: {
        player: this.data.loser.player.id,
        score: this.data.loser.score
      }
    };
  }
}

export type EndPhaseEventMap = {
  [END_PHASE_EVENTS.BATTLEFIELD_SCORED]: BattleFieldscoredEvent;
};
