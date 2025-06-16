export type MatchmakingStrategy<T> = {
  sorter(a: MatchmakingParticipant<T>, b: MatchmakingParticipant<T>): number;
  matcher(a: MatchmakingParticipant<T>, b: MatchmakingParticipant<T>): boolean;
  processUnmatched(participant: T): T;
  equals(a: T, b: T): boolean;
};

export type MatchmakingParticipant<T> = {
  id: number;
  data: T;
  joinedAt: number;
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

  makePairs(): {
    pairs: [T, T][];
    remaining: T[];
  } {
    const sorted = this._participants.sort(this.strategy.sorter);

    const pairs: [T, T][] = [];
    const remaining: MatchmakingParticipant<T>[] = [];

    while (sorted.length > 1) {
      const a = sorted.shift()!;
      const b = sorted.shift()!;

      if (this.strategy.matcher(a, b)) {
        pairs.push([a.data, b.data]);
      } else {
        remaining.push(a, b);
      }
    }

    this._participants = remaining.map((participant) => {
      return {
        id: participant.id,
        data: this.strategy.processUnmatched(participant.data),
        joinedAt: participant.joinedAt,
      };
    });

    return { pairs, remaining: remaining.map((p) => p.data) };
  }

  join(participant: T) {
    const hasAlreadyJoined = this._participants.some((p) =>
      this.strategy.equals(p.data, participant)
    );

    if (hasAlreadyJoined) return;

    const id = this.nextId++;
    this._participants.push({
      id,
      joinedAt: Date.now(),
      data: participant,
    });

    return id;
  }

  leave(id: number): void {
    const index = this._participants.findIndex((p) => p.id === id);
    if (index === -1) return;
    this._participants.splice(index, 1);
  }
}

export type MatchmakingRunnerOptions<T> = {
  getInterval: (ctx: {
    matchmaking: Matchmaking<T>;
    timeRan: number;
  }) => number;
  strategy: MatchmakingStrategy<T>;
  handlePair: (a: T, b: T) => void;
};

export class MatchmakingRunner<T> {
  private matchmaking: Matchmaking<T>;

  private intervalId: NodeJS.Timeout | null = null;

  private startedAt: number | null = null;

  constructor(private options: MatchmakingRunnerOptions<T>) {
    this.matchmaking = new Matchmaking(options.strategy);
  }

  get isRunning() {
    return this.intervalId !== null;
  }

  get timeRan() {
    if (!this.startedAt) return 0;
    return Date.now() - this.startedAt;
  }

  tick() {
    this.intervalId = setTimeout(
      () => {
        const { pairs, remaining } = this.matchmaking.makePairs();

        pairs.forEach(([a, b]) => {
          this.options.handlePair(a, b);
        });

        if (!remaining.length) {
          this.stop();
          return;
        }

        this.tick();
      },
      this.options.getInterval({
        matchmaking: this.matchmaking,
        timeRan: this.timeRan,
      })
    );
  }

  start() {
    if (this.intervalId) return;

    this.startedAt = Date.now();
    this.tick();
  }

  stop() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  join(participant: T) {
    const id = this.matchmaking.join(participant);
    if (!this.intervalId) {
      this.start();
    }

    return id;
  }

  leave(id: number) {
    this.matchmaking.leave(id);
    if (this.matchmaking.isEmpty) {
      this.stop();
    }
  }
}
