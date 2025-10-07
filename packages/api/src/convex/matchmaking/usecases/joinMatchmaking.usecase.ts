import type { AuthSession } from '../../auth/entities/session.entity';
import type { DeckId } from '../../deck/entities/deck.entity';
import { ensureHasNoCurrentGame } from '../../game/game.guards';
import type { GameRepository } from '../../game/repositories/game.repository';
import { type UseCase } from '../../usecase';
import type { UserReadRepository } from '../../users/repositories/user.repository';
import { AppError } from '../../utils/error';
import type { MatchmakingRepository } from '../repositories/matchmaking.repository';
import type { MatchmakingUserRepository } from '../repositories/matchmakingUser.repository';

export type JoinMatchmakingInput = {
  name: string;
  deckId: DeckId;
};

export interface JoinMatchmakingOutput {
  success: true;
}

export class JoinMatchmakingUseCase
  implements UseCase<JoinMatchmakingInput, JoinMatchmakingOutput>
{
  static INJECTION_KEY = 'joinMatchmakingUseCase' as const;

  constructor(
    private ctx: {
      session: AuthSession;
      matchmakingRepo: MatchmakingRepository;
      matchmakingUserRepo: MatchmakingUserRepository;
      userRepo: UserReadRepository;
      gameRepo: GameRepository;
    }
  ) {}
  private async leaveIfNeeded() {
    const currentMatchmaking = await this.ctx.matchmakingRepo.getByUserId(
      this.ctx.session.userId
    );

    if (currentMatchmaking) {
      currentMatchmaking.leave(this.ctx.session.userId);
      await this.ctx.matchmakingRepo.save(currentMatchmaking);
    }
  }

  async execute(input: JoinMatchmakingInput): Promise<JoinMatchmakingOutput> {
    await ensureHasNoCurrentGame(this.ctx.gameRepo, this.ctx.session.userId);
    const matchmaking = await this.ctx.matchmakingRepo.getByName(input.name);

    if (!matchmaking) {
      throw new AppError('Matchmaking not found');
    }

    await this.leaveIfNeeded();

    const user = await this.ctx.userRepo.getById(this.ctx.session.userId);
    if (!user) {
      throw new AppError('User not found');
    }

    const matchmakingUser = await this.ctx.matchmakingUserRepo.create({
      matchmakingId: matchmaking.id,
      userId: this.ctx.session.userId,
      mmr: user.mmr,
      deckId: input.deckId
    });

    matchmaking.join(matchmakingUser);
    if (!matchmaking.isRunning) {
      await this.ctx.matchmakingRepo.scheduleRun(matchmaking);
    }

    await this.ctx.matchmakingRepo.save(matchmaking);

    return { success: true };
  }
}
