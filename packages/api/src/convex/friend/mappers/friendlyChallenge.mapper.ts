import type {
  FriendlyChallenge,
  FriendlyChallengeDoc
} from '../entities/friendlyChallenge.entity';

export class FriendlyChallengeMapper {
  static INJECTION_KEY = 'friendlyChallengeMapper' as const;

  toPersistence(
    friendlyChallenge: FriendlyChallenge
  ): Omit<FriendlyChallengeDoc, '_id' | '_creationTime'> {
    return {
      challengerId: friendlyChallenge.challengerId,
      challengedId: friendlyChallenge.challengedId,
      status: friendlyChallenge.status,
      challengerDeckId: friendlyChallenge.challengerDeckId,
      challengedDeckId: friendlyChallenge.challengedDeckId,
      gameId: friendlyChallenge.gameId,
      options: friendlyChallenge.options
    };
  }
}
