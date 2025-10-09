import { eventEmitter, type EventEmitter } from '../shared/eventEmitter';
import type { Scheduler } from 'convex/server';
import { internal } from '../_generated/api';
import { FriendlyChallengeAcceptedEvent } from './events/friendlyChallengeAccepted.event';

export class FriendSubscribers {
  static INJECTION_KEY = 'friendSubscribers' as const;

  constructor(private ctx: { scheduler: Scheduler; eventEmitter: EventEmitter }) {
    eventEmitter.on(
      FriendlyChallengeAcceptedEvent.EVENT_NAME,
      this.onFriendChallengeAccepted.bind(this)
    );
  }

  private async onFriendChallengeAccepted(event: FriendlyChallengeAcceptedEvent) {
    await this.ctx.scheduler.runAfter(0, internal.friends.clearAllPendingChallenges, {
      userIds: [event.challenge.challengerId, event.challenge.challengedId]
    });
  }
}
