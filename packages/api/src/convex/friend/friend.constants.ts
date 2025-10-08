import type { Values } from '@game/shared';

export const FRIEND_REQUEST_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
} as const;

export type FriendRequestStatus = Values<typeof FRIEND_REQUEST_STATUS>;

export const FRIENDLY_CHALLENGE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined'
} as const;

export type FriendlyChallengeStatus = Values<typeof FRIENDLY_CHALLENGE_STATUS>;
