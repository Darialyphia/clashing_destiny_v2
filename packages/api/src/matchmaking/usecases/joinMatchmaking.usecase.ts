import type { AuthSession } from '../../auth/entities/session.entity';
import { UseCase } from '../../usecase';
import { User } from '../../users/entities/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { DomainError } from '../../utils/error';
import { Matchmaking } from '../entities/matchmaking.entity';
import { MatchmakingUser } from '../entities/matchmakingUser.entity';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';
import { MatchmakingUserRepository } from '../repositories/matchmakingUser.repository';

export type JoinMatchmakingInput = {
  name: string;
};

export interface JoinMatchmakingOutput {
  success: true;
}

export type JoinMatchmakingCtx = {
  session: AuthSession;
  matchmakingRepo: MatchmakingRepository;
  matchmakingUserRepo: MatchmakingUserRepository;
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

  get matchmakingUserRepo() {
    return this.ctx.matchmakingUserRepo;
  }

  get userRepo() {
    return this.ctx.userRepo;
  }

  private async leaveIfNeeded() {
    const currentMatchmaking = await this.matchmakingRepo.getByUserId(
      this.session.userId
    );

    if (currentMatchmaking) {
      currentMatchmaking.leave(this.session.userId);
      await this.matchmakingRepo.save(currentMatchmaking);
    }
  }

  async execute(input: JoinMatchmakingInput): Promise<JoinMatchmakingOutput> {
    const matchmaking = await this.matchmakingRepo.getByName(input.name);

    if (!matchmaking) {
      throw new DomainError('Matchmaking not found');
    }

    await this.leaveIfNeeded();

    await this.matchmakingUserRepo.create({
      matchmakingId: matchmaking.id,
      userId: this.session.userId
    });

    return { success: true };
  }
}
