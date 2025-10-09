import type { UserId } from 'lucia';
import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { FRIENDLY_CHALLENGE_STATUS } from '../friend.constants';
import type { DeckId } from '../../deck/entities/deck.entity';

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

  get canSelectDeck() {
    return this.data.status === FRIENDLY_CHALLENGE_STATUS.ACCEPTED;
  }

  get options() {
    return this.data.options;
  }

  selectDeck(userId: UserId, deckId: DeckId) {
    if (this.data.challengerId === userId) {
      this.data.challengerDeckId = deckId;
    } else if (this.data.challengedId === userId) {
      this.data.challengedDeckId = deckId;
    } else {
      throw new Error('User is not part of this challenge');
    }
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

  accept() {
    this.data.status = FRIENDLY_CHALLENGE_STATUS.ACCEPTED;
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
