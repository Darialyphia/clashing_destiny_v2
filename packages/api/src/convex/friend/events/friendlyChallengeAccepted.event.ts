import type { FriendlyChallenge } from '../entities/friendlyChallenge.entity';

export class FriendlyChallengeAcceptedEvent {
  static EVENT_NAME = 'friendlyChallengeAccepted' as const;

  constructor(readonly challenge: FriendlyChallenge) {}
}
