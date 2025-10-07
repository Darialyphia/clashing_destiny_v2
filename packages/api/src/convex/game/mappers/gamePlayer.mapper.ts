import type { BetterOmit } from 'convex/server';
import type { GamePlayer, GamePlayerDoc } from '../entities/gamePlayer.entity';

export class GamePlayerMapper {
  static INJECTION_KEY = 'gamePlayerMapper' as const;

  toPersistence(gamePlayer: GamePlayer): BetterOmit<GamePlayerDoc, '_creationTime'> {
    return {
      _id: gamePlayer.id,
      gameId: gamePlayer.gameId,
      userId: gamePlayer.userId,
      deckId: gamePlayer.deckId
    };
  }
}
