export type MatchmakingStrategy<T> = {
  sorter(a: MatchmakingParticipant<T>, b: MatchmakingParticipant<T>): number;
  matcher(a: MatchmakingParticipant<T>, b: MatchmakingParticipant<T>): boolean;
  processUnmatched(participant: T, timeSpentInSeconds: number): T;
  equals(a: T, b: T): boolean;
  getBucket(participant: MatchmakingParticipant<T>): string | number;
  getMaxSearchDistance(participant: MatchmakingParticipant<T>): number;
  maxCrossBucketSearch: number;
};

export type MatchmakingParticipant<T> = {
  id: number;
  data: T;
  joinedAt: number;
  triedParticipants: Set<number>;
};

export class Matchmaking<T> {
  private _participants: MatchmakingParticipant<T>[] = [];

  private nextId = 0;

  constructor(private strategy: MatchmakingStrategy<T>) {}

  get count() {
    return this._participants.length;
  }

  get participants() {
    return [...this._participants];
  }

  get isEmpty() {
    return this._participants.length === 0;
  }

  private makeBuckets(sorted: MatchmakingParticipant<T>[]) {
    const buckets = new Map<string | number, MatchmakingParticipant<T>[]>();
    sorted.forEach(participant => {
      const bucket = this.strategy.getBucket!(participant);
      if (!buckets.has(bucket)) {
        buckets.set(bucket, []);
      }
      buckets.get(bucket)!.push(participant);
    });
    return buckets;
  }

  private matchWithinBucket(
    bucketParticipants: MatchmakingParticipant<T>[],
    pairs: [T, T][],
    matched: Set<number>
  ): void {
    for (let i = 0; i < bucketParticipants.length; i++) {
      const participant = bucketParticipants[i];
      if (matched.has(participant.id)) continue;

      for (let j = i + 1; j < bucketParticipants.length; j++) {
        const candidate = bucketParticipants[j];

        const shouldSkip =
          matched.has(candidate.id) || participant.triedParticipants.has(candidate.id);
        if (shouldSkip) continue;

        participant.triedParticipants.add(candidate.id);
        candidate.triedParticipants.add(participant.id);

        if (this.strategy.matcher(participant, candidate)) {
          pairs.push([participant.data, candidate.data]);
          matched.add(participant.id);
          matched.add(candidate.id);
          break;
        }
      }
    }
  }

  private matchAcrossBuckets(
    sorted: MatchmakingParticipant<T>[],
    pairs: [T, T][],
    matched: Set<number>
  ): void {
    const unmatched = sorted.filter(p => !matched.has(p.id));

    for (let i = 0; i < unmatched.length; i++) {
      const participant = unmatched[i];
      if (matched.has(participant.id)) continue;

      const searchLimit = Math.min(
        i + this.strategy.maxCrossBucketSearch,
        unmatched.length
      );

      for (let j = i + 1; j < searchLimit; j++) {
        const candidate = unmatched[j];

        const shouldSkip =
          matched.has(candidate.id) || participant.triedParticipants.has(candidate.id);
        if (shouldSkip) continue;

        participant.triedParticipants.add(candidate.id);
        candidate.triedParticipants.add(participant.id);

        if (this.strategy.matcher(participant, candidate)) {
          pairs.push([participant.data, candidate.data]);
          matched.add(participant.id);
          matched.add(candidate.id);
          break;
        }
      }
    }
  }

  private updateRemainingParticipants(remaining: MatchmakingParticipant<T>[]): void {
    this._participants = [];
    remaining.forEach(participant => {
      participant.triedParticipants.clear();
      participant.data = this.strategy.processUnmatched(
        participant.data,
        (Date.now() - participant.joinedAt) / 1000
      );
      this._participants.push(participant);
    });
  }

  makePairs(): {
    pairs: [T, T][];
    remaining: T[];
  } {
    const sorted = this._participants.slice().sort(this.strategy.sorter);

    const buckets = this.makeBuckets(sorted);

    const pairs: [T, T][] = [];
    const matched = new Set<number>();

    for (const bucket of buckets.values()) {
      this.matchWithinBucket(bucket, pairs, matched);
    }

    this.matchAcrossBuckets(sorted, pairs, matched);

    const remaining = sorted.filter((p: MatchmakingParticipant<T>) => !matched.has(p.id));
    this.updateRemainingParticipants(remaining);

    return { pairs, remaining: remaining.map((p: MatchmakingParticipant<T>) => p.data) };
  }

  join(participant: T, joinedAt = Date.now()): number | undefined {
    const hasAlreadyJoined = this._participants.some(p =>
      this.strategy.equals(p.data, participant)
    );

    if (hasAlreadyJoined) return;

    const id = this.nextId++;
    this._participants.push({
      id,
      joinedAt,
      data: participant,
      triedParticipants: new Set()
    });

    return id;
  }

  leave(id: number): void {
    const index = this._participants.findIndex(p => p.id === id);
    if (index === -1) return;
    this._participants.splice(index, 1);
  }
}
