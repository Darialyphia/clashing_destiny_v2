import type { FriendlyChallengeAcceptedEvent } from './events/friendlyChallengeAccepted.event';

export type FriendEventMap = {
  [FriendlyChallengeAcceptedEvent.EVENT_NAME]: FriendlyChallengeAcceptedEvent;
};
