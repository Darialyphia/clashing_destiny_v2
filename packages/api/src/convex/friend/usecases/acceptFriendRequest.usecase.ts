import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import { AppError } from '../../utils/error';
import type { FriendRequestId } from '../entities/friendRequest.entity';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type AcceptFriendRequestInput = {
  friendRequestId: FriendRequestId;
};

export type AcceptFriendRequestOutput = {
  success: boolean;
};

export class AcceptFriendRequestUseCase
  implements UseCase<AcceptFriendRequestInput, AcceptFriendRequestOutput>
{
  static INJECTION_KEY = 'acceptFriendRequestUseCase' as const;

  constructor(
    private ctx: {
      friendRequestRepo: FriendRequestRepository;
      friendRequestMapper: FriendRequestMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: AcceptFriendRequestInput): Promise<AcceptFriendRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const friendRequest = await this.ctx.friendRequestRepo.getById(input.friendRequestId);
    if (!friendRequest) {
      throw new AppError('Friend request not found');
    }

    if (!friendRequest.canAccept(session.userId)) {
      throw new AppError('You are not authorized to accept this friend request');
    }

    friendRequest.accept();
    await this.ctx.friendRequestRepo.save(friendRequest);

    return { success: true };
  }
}
