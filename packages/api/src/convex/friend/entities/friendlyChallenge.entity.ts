import type { UserId } from 'lucia';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { FRIENDLY_CHALLENGE_STATUS } from '../friend.constants';

export type FriendlyChallengeId = Id<'friendlyChallenges'>;
export type FriendlyChallengeDoc = Doc<'friendlyChallenges'>;

export class FriendlyChallenge extends Entity<FriendlyChallengeId, FriendlyChallengeDoc> {
  static from(doc: FriendlyChallengeDoc) {
    return new FriendlyChallenge(doc._id, doc);
  }

  constructor(id: FriendlyChallengeId, data: FriendlyChallengeDoc) {
    super(id, data);
  }

  get challengerId() {
    return this.data.challengerId;
  }

  get challengedId() {
    return this.data.challengedId;
  }

  get status() {
    return this.data.status;
  }

  get challengerDeckId() {
    return this.data.challengerDeckId;
  }

  get challengedDeckId() {
    return this.data.challengedDeckId;
  }

  get gameId() {
    return this.data.gameId;
  }

  canAccept(userId: UserId) {
    return (
      this.data.challengedId === userId &&
      this.data.status === FRIENDLY_CHALLENGE_STATUS.PENDING
    );
  }

  canDecline(userId: UserId) {
    return (
      this.data.challengedId === userId &&
      this.data.status === FRIENDLY_CHALLENGE_STATUS.PENDING
    );
  }

  canCancel(userId: UserId) {
    return (
      this.data.challengerId === userId &&
      this.data.status === FRIENDLY_CHALLENGE_STATUS.PENDING
    );
  }

  accept(challengedDeckId: Id<'decks'>) {
    this.data.status = FRIENDLY_CHALLENGE_STATUS.ACCEPTED;
    this.data.challengedDeckId = challengedDeckId;
  }

  decline() {
    this.data.status = FRIENDLY_CHALLENGE_STATUS.DECLINED;
  }

  setGame(gameId: Id<'games'>) {
    this.data.gameId = gameId;
  }

  isPending() {
    return this.data.status === FRIENDLY_CHALLENGE_STATUS.PENDING;
  }

  isAccepted() {
    return this.data.status === FRIENDLY_CHALLENGE_STATUS.ACCEPTED;
  }

  isDeclined() {
    return this.data.status === FRIENDLY_CHALLENGE_STATUS.DECLINED;
  }
}
