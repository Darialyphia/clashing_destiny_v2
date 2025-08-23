import { Matchmaking, type MatchmakingStrategy } from './matchmaking';

export type MatchmakingRunnerOptions<T> = {
  getInterval: (ctx: { matchmaking: Matchmaking<T>; timeRan: number }) => number;
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
        timeRan: this.timeRan
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
