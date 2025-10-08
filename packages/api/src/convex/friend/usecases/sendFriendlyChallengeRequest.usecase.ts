import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { Id } from '../../_generated/dataModel';
import type { FriendlyChallengeMapper } from '../mappers/friendlyChallenge.mapper';
import type { FriendlyChallengeRepository } from '../repositories/friendlyChallenge.repository';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type SendFriendlyChallengeRequestInput = {
  challengedUserId: Id<'users'>;
};

export type SendFriendlyChallengeRequestOutput = {
  challengeId: Id<'friendlyChallenges'>;
};

export class SendFriendlyChallengeRequestUseCase
  implements
    UseCase<SendFriendlyChallengeRequestInput, SendFriendlyChallengeRequestOutput>
{
  static INJECTION_KEY = 'sendFriendlyChallengeRequestUseCase' as const;

  constructor(
    private ctx: {
      friendlyChallengeRepo: FriendlyChallengeRepository;
      friendRequestRepo: FriendRequestRepository;
      friendlyChallengeMapper: FriendlyChallengeMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(
    input: SendFriendlyChallengeRequestInput
  ): Promise<SendFriendlyChallengeRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    if (session.userId === input.challengedUserId) {
      throw new AppError('You cannot challenge yourself');
    }

    const areFriends = await this.ctx.friendRequestRepo.areFriends(
      session.userId,
      input.challengedUserId
    );

    if (!areFriends) {
      throw new AppError('You can only challenge users who are in your friends list');
    }

    // Check if there's already a pending challenge between these users
    const existingChallenge =
      await this.ctx.friendlyChallengeRepo.getPendingChallengeBetweenUsers(
        session.userId,
        input.challengedUserId
      );

    if (existingChallenge) {
      throw new AppError('You already have a pending challenge with this user');
    }

    // Create the friendly challenge
    const challengeId = await this.ctx.friendlyChallengeRepo.create({
      challengerId: session.userId,
      challengedId: input.challengedUserId,
      status: 'pending'
    });

    return { challengeId };
  }
}
