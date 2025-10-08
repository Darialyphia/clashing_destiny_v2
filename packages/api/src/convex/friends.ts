import { v } from 'convex/values';
import { GetFriendsUseCase } from './friend/usecases/getFriends.usecase';
import { GetPendingRequestsUseCase } from './friend/usecases/getPendingRequests.usecase';
import { MarkFriendRequestAsSeenUseCase } from './friend/usecases/markFriendRequestAsSeen.usecase';
import { mutationWithContainer, queryWithContainer } from './shared/container';
import { SendFriendRequestUseCase } from './friend/usecases/sendFriendRequest.usecase';
import { AcceptFriendRequestUseCase } from './friend/usecases/acceptFriendRequest.usecase';
import { DeclineFriendRequestUseCase } from './friend/usecases/declineFriendRequest.usecase';

export const list = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetFriendsUseCase>(GetFriendsUseCase.INJECTION_KEY);

    return usecase.execute();
  }
});

export const pendingRequests = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<GetPendingRequestsUseCase>(
      GetPendingRequestsUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const markFriendRequestsAsSeen = queryWithContainer({
  args: {},
  handler: async ctx => {
    const usecase = ctx.resolve<MarkFriendRequestAsSeenUseCase>(
      MarkFriendRequestAsSeenUseCase.INJECTION_KEY
    );

    return usecase.execute();
  }
});

export const sendFriendRequest = mutationWithContainer({
  args: {
    receiverUsername: v.string()
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<SendFriendRequestUseCase>(
      SendFriendRequestUseCase.INJECTION_KEY
    );

    return usecase.execute({ receiverUsername: args.receiverUsername });
  }
});

export const acceptFriendRequest = mutationWithContainer({
  args: {
    friendRequestId: v.id('friendRequests')
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<AcceptFriendRequestUseCase>(
      AcceptFriendRequestUseCase.INJECTION_KEY
    );

    return usecase.execute({ friendRequestId: args.friendRequestId });
  }
});

export const declineFriendRequest = mutationWithContainer({
  args: {
    friendRequestId: v.id('friendRequests')
  },
  handler: async (ctx, args) => {
    const usecase = ctx.resolve<DeclineFriendRequestUseCase>(
      DeclineFriendRequestUseCase.INJECTION_KEY
    );

    return usecase.execute({ friendRequestId: args.friendRequestId });
  }
});
