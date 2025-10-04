import { QueryUseCase } from '../../usecase';
import type { MatchmakingId } from '../entities/matchmaking.entity';

export type GetMatchmakingsOutput = Array<{
  id: MatchmakingId;
  name: string;
  enabled: boolean;
}>;

export class GetMatchmakingsUsecase extends QueryUseCase<never, GetMatchmakingsOutput> {
  static INJECTION_KEY = 'getMatchmakingsUsecase' as const;

  async execute(): Promise<GetMatchmakingsOutput> {
    const matchmakings = await this.ctx.db.query('matchmaking').collect();
    return matchmakings.map(m => ({
      id: m._id,
      name: m.name,
      enabled: m.enabled
    }));
  }
}
