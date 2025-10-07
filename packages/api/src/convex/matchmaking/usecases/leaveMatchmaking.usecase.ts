import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import { type UseCase } from '../../usecase';
import { DomainError } from '../../utils/error';
import type { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type LeaveMatchmakingInput = never;

export interface LeaveMatchmakingOutput {
  success: true;
}

export class LeaveMatchmakingUseCase
  implements UseCase<LeaveMatchmakingInput, LeaveMatchmakingOutput>
{
  static INJECTION_KEY = 'leaveMatchmakingUseCase' as const;

  constructor(
    private ctx: { session: AuthSession; matchmakingRepo: MatchmakingRepository }
  ) {}

  async execute(): Promise<LeaveMatchmakingOutput> {
    const session = ensureAuthenticated(this.ctx.session);
    const matchmaking = await this.ctx.matchmakingRepo.getByUserId(
      this.ctx.session.userId
    );

    if (!matchmaking) {
      throw new DomainError('User is not in matchmaking');
    }

    matchmaking.leave(session.userId);
    await this.ctx.matchmakingRepo.save(matchmaking);
    return { success: true };
  }
}
