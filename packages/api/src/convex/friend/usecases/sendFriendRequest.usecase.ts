import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { UserRepository } from '../../users/repositories/user.repository';
import { Username } from '../../users/username';
import { AppError } from '../../utils/error';
import { FRIEND_REQUEST_STATUS } from '../friend.constants';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type SendFriendRequestInput = {
  receiverUsername: string;
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
      userRepo: UserRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(input: SendFriendRequestInput): Promise<SendFriendRequestOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const username = new Username(input.receiverUsername);
    const user = await this.ctx.userRepo.getByUsername(username);
    if (!user) {
      return { success: true }; // Silently ignore if user does not exis1t
    }

    if (session.userId === user.id) {
      throw new AppError("You can't send a friend request to yourself");
    }

    const existingRequest = await this.ctx.friendRequestRepo.getBySenderAndReceiver(
      session.userId,
      user.id
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
        receiverId: user.id,
        status: FRIEND_REQUEST_STATUS.PENDING,
        seen: false
      });
    }

    return { success: true };
  }
}
