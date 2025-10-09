import { success } from 'zod';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';

export type ClearAllPendingChallengesInput = {
  userIds: UserId[];
};

export type ClearAllPendingChallengesOutput = {
  success: boolean;
};

export class ClearAllPendingChallengesUseCase
  implements UseCase<ClearAllPendingChallengesInput, ClearAllPendingChallengesOutput>
{
  static INJECTION_KEY = 'clearAllPendingChallengesUseCase' as const;

  constructor(private ctx: { friendlyChallengeRepo: FriendlyChallengeRepository }) {}

  async execute(
    input: ClearAllPendingChallengesInput
  ): Promise<ClearAllPendingChallengesOutput> {
    for (const userId of input.userIds) {
      const challenges = await Promise.all([
        this.ctx.friendlyChallengeRepo.getPendingByChallengerId(userId),
        this.ctx.friendlyChallengeRepo.getPendingByChallengedId(userId)
      ]);
      const allChallenges = challenges.flat();
      await Promise.all(
        allChallenges.map(async challenge => {
          if (challenge.canCancel(userId)) {
            await this.ctx.friendlyChallengeRepo.save(challenge);
            await this.ctx.friendlyChallengeRepo.delete(challenge.id);
          } else if (challenge.canDecline(userId)) {
            challenge.decline();
          }
        })
      );
    }

    return { success: true };
  }
}
