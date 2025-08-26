import type { Id } from '../../_generated/dataModel';
import { User } from '../../users/entities/user.entity';
import { AppError, DomainError } from '../../utils/error';
import { MatchmakingRepository } from '../repositories/matchmaking.repository';

export type MatchmakingServiceContext = {
  matchmakingRepo: MatchmakingRepository;
};

export class MatchmakingService {
  constructor(private context: MatchmakingServiceContext) {}

  private get matchmakingRepo() {
    return this.context.matchmakingRepo;
  }

  async join(user: User, matchmakingId: Id<'matchmaking'>): Promise<void> {
    const matchmaking = await this.matchmakingRepo.getById(matchmakingId);
    if (!matchmaking) {
      throw new DomainError('Matchmaking session not found');
    }

    if (!user.canJoinMatchmaking(matchmaking)) {
      throw new AppError('User cannot join this matchmaking');
    }

    const currentMatchmaking = user.getCurrentMatchmaking();
    if (currentMatchmaking?.id) {
      await this.matchmakingRepo.delete(currentMatchmaking.id);
    }

    const matchmakingUserRecord = await this.db
      .query('matchmakingUsers')
      .filter(q => q.eq(q.field('userId'), user.id))
      .filter(q => q.eq(q.field('matchmakingId'), matchmakingId))
      .first();

    if (!matchmakingUserRecord) {
      throw new AppError('User is not part of this matchmaking');
    }

    const matchmakingUser = await this.buildMatchmakingUserEntity(matchmakingUserRecord);
    matchmaking.join(matchmakingUser);

    await this.db.insert('matchmakingUsers', {
      userId: matchmakingUser.userId,
      matchmakingId: matchmakingUser.matchmakingId
    });
  }
}
