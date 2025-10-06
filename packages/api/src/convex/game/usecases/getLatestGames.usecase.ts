import type { DeckId } from '../../deck/entities/deck.entity';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { GameId } from '../entities/game.entity';
import type { GameStatus } from '../game.constants';
import type { GameReadRepository } from '../repositories/game.repository';
import type { GamePlayerReadRepository } from '../repositories/gamePlayer.repository';

export type GetLatestGamesInput = {
  status: GameStatus;
};

export type GetLatestGamesOutput = {
  games: Array<{
    id: GameId;
    status: GameStatus;
    players: Array<{ userId: UserId; deckId: DeckId }>;
  }>;
};

export class GetLatestGamesUseCase
  implements UseCase<GetLatestGamesInput, GetLatestGamesOutput>
{
  static INJECTION_KEY = 'getLatestGamesUseCase' as const;

  constructor(
    private ctx: {
      gameReadRepo: GameReadRepository;
      gamePlayerReadRepo: GamePlayerReadRepository;
    }
  ) {}

  async execute(input: GetLatestGamesInput): Promise<GetLatestGamesOutput> {
    const games = await this.ctx.gameReadRepo.getLatestByStatus(input.status);

    const gamesWithPlayers = await Promise.all(
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
    );

    return { games: gamesWithPlayers };
  }
}
