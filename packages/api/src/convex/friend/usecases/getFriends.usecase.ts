import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { Id } from '../../_generated/dataModel';
import type { FriendRequestReadRepository } from '../repositories/friendRequest.repository';
import type { UserReadRepository } from '../../users/repositories/user.repository';

export type GetFriendsOutput = {
  id: Id<'users'>;
  username: string;
}[];

export class GetFriendsUseCase implements UseCase<never, GetFriendsOutput> {
  static INJECTION_KEY = 'getFriendsUseCase' as const;

  constructor(
    private ctx: {
      friendRequestReadRepo: FriendRequestReadRepository;
      userReadRepo: UserReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<GetFriendsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const acceptedFriendRequests =
      await this.ctx.friendRequestReadRepo.getAcceptedByUserId(session.userId);

    const friendUserIds = acceptedFriendRequests.map(request => {
      return request.senderId === session.userId ? request.receiverId : request.senderId;
    });

    const uniqueFriendUserIds = [...new Set(friendUserIds)];

    const friends = await Promise.all(
      uniqueFriendUserIds.map(async userId => {
        const user = await this.ctx.userReadRepo.getById(userId);
        return {
          id: userId,
          username: user!.username
        };
      })
    );

    return friends.sort((a, b) => a.username.localeCompare(b.username));
  }
}
