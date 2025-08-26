import type { AuthSession } from '../../auth/entities/session.entity';
import { UseCase } from '../../usecase';
import { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type JoinMatchmakingInput = {
  name: string;
};

export interface JoinMatchmakingOutput {
  success: true;
}

export type JoinMatchmakingCtx = {
  session: AuthSession;
  matchmakingRepo: MatchmakingRepository;
  userRepo: UserRepository;
};

export class JoinMatchmakingUseCase extends UseCase<
  JoinMatchmakingInput,
  JoinMatchmakingOutput,
  JoinMatchmakingCtx
> {
  get session() {
    return this.ctx.session;
  }

  get matchmakingRepo() {
    return this.ctx.matchmakingRepo;
  }

  get userRepo() {
    return this.ctx.userRepo;
  }

  async execute(input: JoinMatchmakingInput): Promise<JoinMatchmakingOutput> {
    const matchmaking = await this.matchmakingRepo.getByName(input.name);
    if (!matchmaking) {
      throw new DomainError('Matchmaking not found');
    }

    const user = await this.userRepo.getById(this.session.userId, {
      include: { currentMatchmaking: true }
    });
    if (!user) {
      throw new DomainError('User not found');
    }

    await this.matchmakingRepo.joinMatchmaking(user, matchmaking.id);

    return { success: true };
  }
}
