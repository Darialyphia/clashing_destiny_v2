import type { DeckId } from '../../deck/entities/deck.entity';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { GameId } from '../entities/game.entity';
import type { GameStatus } from '../game.constants';
import type { GameReadRepository } from '../repositories/game.repository';
import type { GamePlayerReadRepository } from '../repositories/gamePlayer.repository';

// upper bound so the query stays within convex limits, newest games come first
export const MAX_GAMES_BY_STATUS = 200;

export type GetGamesByStatusInput = {
  status: GameStatus;
};

export type GetGamesByStatusOutput = {
  games: Array<{
    id: GameId;
    status: GameStatus;
    players: Array<{ userId: UserId; deckId: DeckId }>;
  }>;
};

export class GetGamesByStatusUseCase
  implements UseCase<GetGamesByStatusInput, GetGamesByStatusOutput>
{
  static INJECTION_KEY = 'getGamesByStatusUseCase' as const;

  constructor(
    private ctx: {
      gameReadRepo: GameReadRepository;
      gamePlayerReadRepo: GamePlayerReadRepository;
    }
  ) {}

  async execute(input: GetGamesByStatusInput): Promise<GetGamesByStatusOutput> {
    const games = await this.ctx.gameReadRepo.getByStatus(
      input.status,
      MAX_GAMES_BY_STATUS
    );

    return {
      games: await Promise.all(
        games.map(async game => {
          const players = await this.ctx.gamePlayerReadRepo.byGameId(game._id);

          return {
            id: game._id,
            status: game.status,
            players: players.map(p => ({
              userId: p.userId,
              deckId: p.deckId
            }))
          };
        })
      )
    };
  }
}
