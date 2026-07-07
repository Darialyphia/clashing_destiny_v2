import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import { Clock } from './clock';
import type { UserId } from '@game/api';

export type ClockState = Record<
  UserId,
  {
    max: number;
    remaining: number;
    isActive: boolean;
  }
>;

export const CLOCK_MANAGER_EVENTS = {
  TICK: 'tick',
  TIMEOUT: 'timeout'
} as const;

type ClockManagerEventMap = {
  [CLOCK_MANAGER_EVENTS.TICK]: ClockState;
  [CLOCK_MANAGER_EVENTS.TIMEOUT]: { playerId: string };
};

export type ClockManagerOptions = {
  playerIds: string[];
  clockTime: number;
  disabled: boolean;
};

const DEFAULT_CLOCK_TIME = 60 * 1000;

export class ClockManager {
  private playerClocks = new Map<string, Clock>();
  private emitter = new TypedEventEmitter<ClockManagerEventMap>('parallel');
  private clockTime: number;
  private disabled: boolean;

  constructor(private options: ClockManagerOptions) {
    this.clockTime = options.clockTime ?? DEFAULT_CLOCK_TIME;
    this.disabled = options.disabled;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  initialize() {
    if (this.disabled) return;

    for (const playerId of this.options.playerIds) {
      const clock = new Clock(this.clockTime);
      this.playerClocks.set(playerId, clock);

      clock.on('tick', () => {
        this.emitClocks();
      });

      clock.on('timeout', async () => {
        await this.emitter.emit(CLOCK_MANAGER_EVENTS.TIMEOUT, { playerId });
      });
    }
  }

  shutdown() {
    this.playerClocks.forEach(clock => {
      clock.shutdown();
    });
    this.playerClocks.clear();
  }

  startClockForPlayer(playerId: string) {
    if (this.disabled) return;
    this.playerClocks.get(playerId)?.start();
  }

  stopClockForPlayer(playerId: string) {
    if (this.disabled) return;
    this.playerClocks.get(playerId)?.stop();
  }

  resetClockForPlayer(playerId: string) {
    if (this.disabled) return;
    this.playerClocks.get(playerId)?.reset();
  }

  resetAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach(clock => clock.reset());
  }

  startAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach(clock => clock.start());
  }

  stopAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach(clock => clock.stop());
  }

  get clockState(): ClockState {
    return Object.fromEntries(
      Array.from(this.playerClocks.entries()).map(([userId, clock]) => [
        userId,
        {
          max: this.clockTime / 1000,
          remaining: Math.round(clock.getRemainingTime() / 1000),
          isActive: clock.isRunning()
        }
      ])
    );
  }

  private emitClocks() {
    void this.emitter.emit(CLOCK_MANAGER_EVENTS.TICK, this.clockState);
  }
}
