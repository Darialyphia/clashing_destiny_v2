import { v } from 'convex/values';
import { GetFriendsUseCase } from './friend/usecases/getFriends.usecase';
import { GetPendingRequestsUseCase } from './friend/usecases/getPendingRequests.usecase';
import { MarkFriendRequestAsSeenUseCase } from './friend/usecases/markFriendRequestAsSeen.usecase';
import { mutationWithContainer, queryWithContainer } from './shared/container';
import { SendFriendRequestUseCase } from './friend/usecases/sendFriendRequest.usecase';
import { AcceptFriendRequestUseCase } from './friend/usecases/acceptFriendRequest.usecase';
import { DeclineFriendRequestUseCase } from './friend/usecases/declineFriendRequest.usecase';
import { SendFriendlyChallengeRequestUseCase } from './friend/usecases/sendFriendlyChallengeRequest.usecase';
import { CancelFriendlyChallengeRequestUseCase } from './friend/usecases/cancelFriendlyChallengeRequest.usecase';

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

export const sendChallengeRequest = mutationWithContainer({
  args: {
    challengedUserId: v.id('users')
  },
  handler: async (ctx, args) => {
    const useCase = ctx.resolve<SendFriendlyChallengeRequestUseCase>(
      SendFriendlyChallengeRequestUseCase.INJECTION_KEY
    );
    return await useCase.execute(args);
  }
});

export const cancelChallengeRequest = mutationWithContainer({
  args: {
    challengeId: v.id('friendlyChallenges')
  },
  handler: async (ctx, args) => {
    const useCase = ctx.resolve<CancelFriendlyChallengeRequestUseCase>(
      CancelFriendlyChallengeRequestUseCase.INJECTION_KEY
    );
    return await useCase.execute({
      challengeId: args.challengeId
    });
  }
});
