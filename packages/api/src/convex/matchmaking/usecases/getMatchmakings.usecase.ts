import type { UseCase } from '../../usecase';
import type { MatchmakingId } from '../entities/matchmaking.entity';
import type { MatchmakingReadRepository } from '../repositories/matchmaking.repository';

export type GetMatchmakingsOutput = Array<{
  id: MatchmakingId;
  name: string;
  description: string;
  enabled: boolean;
}>;

export class GetMatchmakingsUsecase implements UseCase<never, GetMatchmakingsOutput> {
  static INJECTION_KEY = 'getMatchmakingsUsecase' as const;

  constructor(private ctx: { matchmakingReadRepo: MatchmakingReadRepository }) {}

  async execute(): Promise<GetMatchmakingsOutput> {
    const matchmakings = await this.ctx.matchmakingReadRepo.getAll();
    return matchmakings.map(m => ({
      id: m._id,
      name: m.name,
      description: m.description,
      enabled: m.enabled
    }));
  }
}
