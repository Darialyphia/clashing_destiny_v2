import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import type { UserId } from '../../users/entities/user.entity';
import { DomainError } from '../../utils/error';
import { GAME_STATUS } from '../game.constants';
import { GamePlayer } from './gamePlayer.entity';

export type GameData = {
  game: GameDoc;
  players: GamePlayer[];
};

export type GameId = Id<'games'>;
export type GameDoc = Doc<'games'>;

export class Game extends Entity<GameId, GameData> {
  get status() {
    return this.data.game.status;
  }

  get seed() {
    return this.data.game.seed;
  }

  get players() {
    return this.data.players;
  }

  get cancellationId() {
    return this.data.game.cancellationId;
  }

  get winnerId() {
    return this.data.game.winnerId;
  }

  get options() {
    return { ...this.data.game.options };
  }

  hasPlayer(userId: UserId) {
    return this.data.players.some(player => player.userId === userId);
  }

  get canCancel() {
    return this.status === GAME_STATUS.WAITING_FOR_PLAYERS;
  }

  scheduleCancellation(scheduledFunctionId: Id<'_scheduled_functions'>) {
    if (!this.canCancel) {
      throw new DomainError('Game cannot be cancelled');
    }
    this.data.game.cancellationId = scheduledFunctionId;
  }

  cancel() {
    if (!this.canCancel) {
      throw new DomainError('Game cannot be cancelled');
    }
    this.data.game.status = GAME_STATUS.CANCELLED;
  }

  get canStart() {
    return this.status === GAME_STATUS.WAITING_FOR_PLAYERS;
  }

  start() {
    if (!this.canStart) {
      throw new DomainError('Game cannot be started');
    }
    this.data.game.status = GAME_STATUS.ONGOING;
  }

  canFinish() {
    return this.status === GAME_STATUS.ONGOING;
  }

  finish(winnerId: UserId | null) {
    if (!this.canFinish) {
      throw new DomainError('Game cannot be finished');
    }
    this.data.game.status = GAME_STATUS.FINISHED;
    this.data.game.winnerId = winnerId;
  }

  setOptions(options: Partial<GameDoc['options']>) {
    this.data.game.options = {
      ...this.data.game.options,
      ...options
    };
  }
}
