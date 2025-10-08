import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { FriendlyChallengeMapper } from '../mappers/friendlyChallenge.mapper';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';
import type { FriendlyChallengeId } from '../entities/friendlyChallenge.entity';
import { AppError } from '../../utils/error';

export type CancelFriendlyChallengeRequestInput = {
  challengeId: FriendlyChallengeId;
};

export type CancelFriendlyChallengeRequestOutput = {
  success: boolean;
};

export class CancelFriendlyChallengeRequestUseCase
  implements
    UseCase<CancelFriendlyChallengeRequestInput, CancelFriendlyChallengeRequestOutput>
{
  static INJECTION_KEY = 'cancelFriendlyChallengeRequestUseCase' as const;

  constructor(
    private ctx: {
      friendlyChallengeRepo: FriendlyChallengeRepository;
      friendRequestRepo: FriendRequestRepository;
      friendlyChallengeMapper: FriendlyChallengeMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(
    input: CancelFriendlyChallengeRequestInput
  ): Promise<CancelFriendlyChallengeRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const challenge = await this.ctx.friendlyChallengeRepo.getById(input.challengeId);

    if (!challenge) {
      throw new AppError('Challenge not found');
    }

    if (!challenge.canCancel(session.userId)) {
      throw new AppError('You can only cancel your own challenges');
    }

    await this.ctx.friendlyChallengeRepo.delete(challenge.id);

    return { success: true };
  }
}
