import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type KickFromMatchmakingInput = { userId: UserId };
export type KickFromMatchmakingOutput = { success: boolean; removed: boolean };

export class KickFromMatchmakingUseCase
  implements UseCase<KickFromMatchmakingInput, KickFromMatchmakingOutput>
{
  static INJECTION_KEY = 'kickFromMatchmakingUseCase' as const;

  constructor(
    private readonly ctx: {
      matchmakingRepo: MatchmakingRepository;
    }
  ) {}

  async execute(input: KickFromMatchmakingInput): Promise<KickFromMatchmakingOutput> {
    const matchmaking = await this.ctx.matchmakingRepo.getByUserId(input.userId);

    if (!matchmaking) return { success: true, removed: false };

    matchmaking.leave(input.userId);
    await this.ctx.matchmakingRepo.save(matchmaking);

    return { success: true, removed: true };
  }
}
