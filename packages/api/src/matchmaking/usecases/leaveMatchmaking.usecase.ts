import type { AuthSession } from '../../auth/entities/session.entity';
import { UseCase } from '../../usecase';
import { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';
import { MatchmakingUserRepository } from '../repositories/matchmakingUser.repository';

export type LeaveMatchmakingInput = never;

export interface LeaveMatchmakingOutput {
  success: true;
}

export type LeaveMatchmakingCtx = {
  session: AuthSession;
  matchmakingRepo: MatchmakingRepository;
  matchmakingUserRepo: MatchmakingUserRepository;
  userRepo: UserRepository;
};

export class LeaveMatchmakingUseCase extends UseCase<
  LeaveMatchmakingInput,
  LeaveMatchmakingOutput,
  LeaveMatchmakingCtx
> {
  get session() {
    return this.ctx.session;
  }

  get matchmakingRepo() {
    return this.ctx.matchmakingRepo;
  }

  get matchmakingUserRepo() {
    return this.ctx.matchmakingUserRepo;
  }

  get userRepo() {
    return this.ctx.userRepo;
  }

  async execute(): Promise<LeaveMatchmakingOutput> {
    const matchmaking = await this.matchmakingRepo.getByUserId(this.session.userId);

    if (!matchmaking) {
      throw new DomainError('User is not in matchmaking');
    }

    matchmaking.leave(this.session.userId);
    await this.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
