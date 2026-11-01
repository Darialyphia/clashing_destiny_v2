import type { UseCase } from '../../usecase';
import type { GameId } from '../entities/game.entity';
import type { GameStatus } from '../game.constants';
import type { GameReadRepository } from '../repositories/game.repository';

export type GetLiveGamesOutput = {
  games: Array<{
    id: GameId;
    status: GameStatus;
  }>;
};

export class GetLiveGamesUseCase implements UseCase<never, GetLiveGamesOutput> {
  static INJECTION_KEY = 'getLiveGamesUseCase' as const;

  constructor(
    private ctx: {
      gameReadRepo: GameReadRepository;
    }
  ) {}

  async execute(): Promise<GetLiveGamesOutput> {
    const games = await this.ctx.gameReadRepo.getLive();

    return {
      games: games.map(game => ({
        id: game._id,
        status: game.status
      }))
    };
  }
}
