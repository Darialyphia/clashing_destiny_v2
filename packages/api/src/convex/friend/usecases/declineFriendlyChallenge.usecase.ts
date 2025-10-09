import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { FriendlyChallengeId } from '../entities/friendlyChallenge.entity';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type DeclineFriendlyChallengeInput = {
  challengeId: FriendlyChallengeId;
};

export type DeclineFriendlyChallengeOutput = {
  success: boolean;
};

export class DeclineFriendlyChallengeUseCase
  implements UseCase<DeclineFriendlyChallengeInput, DeclineFriendlyChallengeOutput>
{
  static INJECTION_KEY = 'declineFriendlyChallengeUseCase' as const;

  constructor(
    private ctx: {
      friendRequestRepo: FriendRequestRepository;
      friendRequestMapper: FriendRequestMapper;
      friendlyChallengeRepo: FriendlyChallengeRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(
    input: DeclineFriendlyChallengeInput
  ): Promise<DeclineFriendlyChallengeOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const friendlyChallenge = await this.ctx.friendlyChallengeRepo.getById(
      input.challengeId
    );
    if (!friendlyChallenge) {
      throw new AppError('Friendly challenge not found');
    }

    if (!friendlyChallenge.canDecline(session.userId)) {
      throw new AppError('You are not authorized to decline this friendly challenge');
    }

    friendlyChallenge.decline();
    await this.ctx.friendlyChallengeRepo.save(friendlyChallenge);

    return { success: true };
  }
}
