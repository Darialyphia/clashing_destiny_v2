import type { FriendRequest, FriendRequestDoc } from '../entities/friendRequest.entity';

export class FriendRequestMapper {
  static INJECTION_KEY = 'friendRequestMapper' as const;

  toPersistence(
    friendRequest: FriendRequest
  ): Omit<FriendRequestDoc, '_id' | '_creationTime'> {
    return {
      senderId: friendRequest.senderId,
      receiverId: friendRequest.receiverId,
      status: friendRequest.status,
      seen: friendRequest.seen
    };
  }
}
