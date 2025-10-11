import type { BetterOmit } from '@game/shared';
import { Game, type GameDoc } from '../entities/game.entity';

export class GameMapper {
  static INJECTION_KEY = 'gameMapper' as const;

  toPersistence(game: Game): BetterOmit<GameDoc, '_creationTime'> {
    return {
      _id: game.id,
      seed: game.seed,
      status: game.status,
      winnerId: game.winnerId,
      cancellationId: game.cancellationId,
      options: game.options
    };
  }
}
