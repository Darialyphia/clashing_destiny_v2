import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { UserId } from '../../users/entities/user.entity';
import { AppError } from '../../utils/error';
import { FRIEND_REQUEST_STATUS } from '../friend.constants';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type SendFriendRequestInput = {
  receiverId: UserId;
};

export type SendFriendRequestOutput = {
  success: boolean;
};

export class SendFriendRequestUseCase
  implements UseCase<SendFriendRequestInput, SendFriendRequestOutput>
{
  static INJECTION_KEY = 'sendFriendRequestUseCase' as const;

  constructor(
    private ctx: {
      friendRequestRepo: FriendRequestRepository;
      friendRequestMapper: FriendRequestMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SendFriendRequestInput): Promise<SendFriendRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    if (session.userId === input.receiverId) {
      throw new AppError("You can't send a friend request to yourself");
    }

    const existingRequest = await this.ctx.friendRequestRepo.getBySenderAndReceiver(
      session.userId,
      input.receiverId
    );
    if (existingRequest && existingRequest.status === FRIEND_REQUEST_STATUS.PENDING) {
      throw new AppError('Friend request already sent to this user');
    }

    if (existingRequest) {
      if (!existingRequest.canResend(session.userId)) {
        throw new AppError(
          'You can only resend a friend request once it has been responded to'
        );
      }
      existingRequest.resend();
      await this.ctx.friendRequestRepo.save(existingRequest);
    } else {
      await this.ctx.friendRequestRepo.create({
        senderId: session.userId,
        receiverId: input.receiverId,
        status: FRIEND_REQUEST_STATUS.PENDING,
        seen: false
      });
    }

    return { success: true };
  }
}
