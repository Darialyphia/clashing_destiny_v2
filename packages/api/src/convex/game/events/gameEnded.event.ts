import type { GameId } from '../entities/game.entity';

export class GameEndedEvent {
  static EVENT_NAME = 'gameEnded' as const;

  constructor(readonly gameId: GameId) {}
}
