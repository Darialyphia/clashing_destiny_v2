import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { FriendRequestId } from '../entities/friendRequest.entity';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type DeclineFriendRequestInput = {
  friendRequestId: FriendRequestId;
};

export type DeclineFriendRequestOutput = {
  success: boolean;
};

export class DeclineFriendRequestUseCase
  implements UseCase<DeclineFriendRequestInput, DeclineFriendRequestOutput>
{
  static INJECTION_KEY = 'declineFriendRequestUseCase' as const;

  constructor(
    private ctx: {
      friendRequestRepo: FriendRequestRepository;
      friendRequestMapper: FriendRequestMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: DeclineFriendRequestInput): Promise<DeclineFriendRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const friendRequest = await this.ctx.friendRequestRepo.getById(input.friendRequestId);
    if (!friendRequest) {
      throw new AppError('Friend request not found');
    }

    if (!friendRequest.canDecline(session.userId)) {
      throw new AppError('You are not authorized to decline this friend request');
    }

    friendRequest.decline();
    await this.ctx.friendRequestRepo.save(friendRequest);

    return { success: true };
  }
}
