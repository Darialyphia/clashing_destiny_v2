import { ensureAuthenticated } from '../../auth/auth.utils';
import type { AuthSession } from '../../auth/entities/session.entity';
import type { UseCase } from '../../usecase';
import type { Id } from '../../_generated/dataModel';
import type { FriendRequestReadRepository } from '../repositories/friendRequest.repository';
import type { UserReadRepository } from '../../users/repositories/user.repository';

export type GetPendingRequestsOutput = {
  id: Id<'friendRequests'>;
  seen: boolean;
  sender: {
    id: Id<'users'>;
    username: string;
  };
}[];

export class GetPendingRequestsUseCase
  implements UseCase<never, GetPendingRequestsOutput>
{
  static INJECTION_KEY = 'getPendingRequestsUseCase' as const;

  constructor(
    private ctx: {
      friendRequestReadRepo: FriendRequestReadRepository;
      userReadRepo: UserReadRepository;
      session: AuthSession | null;
    }
  ) {}

  async execute(): Promise<GetPendingRequestsOutput> {
    const session = ensureAuthenticated(this.ctx.session);

    const pendingRequests = await this.ctx.friendRequestReadRepo.getPendingByReceiverId(
      session.userId
    );

    const requestsWithSenderInfo = await Promise.all(
      pendingRequests.map(async request => {
        const sender = await this.ctx.userReadRepo.getById(request.senderId);

        return {
          id: request._id,
          seen: request.seen,
          sender: {
            id: request.senderId,
            username: sender!.username
          }
        };
      })
    );

    return requestsWithSenderInfo;
  }
}
