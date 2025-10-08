import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { FriendRequestMapper } from '../mappers/friendRequest.mapper';
import type { FriendRequestRepository } from '../repositories/friendRequest.repository';

export type MarkFriendRequestAsSeenOutput = {
  markedCount: number;
};

export class MarkFriendRequestAsSeenUseCase
  implements UseCase<never, MarkFriendRequestAsSeenOutput>
{
  static INJECTION_KEY = 'markFriendRequestAsSeenUseCase' as const;

  constructor(
    private ctx: {
      friendRequestRepo: FriendRequestRepository;
      friendRequestMapper: FriendRequestMapper;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<MarkFriendRequestAsSeenOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const unseenFriendRequests = await this.ctx.friendRequestRepo.getUnseenByReceiverId(
      session.userId
    );

    let markedCount = 0;
    for (const friendRequest of unseenFriendRequests) {
      if (friendRequest.canMarkAsSeen(session.userId)) {
        friendRequest.markAsSeen();
        await this.ctx.friendRequestRepo.save(friendRequest);
        markedCount++;
      }
    }

    return { markedCount };
  }
}
