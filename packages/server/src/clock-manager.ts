import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import { Clock } from './clock';
import type { UserId } from '@game/api';

export type ClockStageState = {
  max: number;
  remaining: number;
  isActive: boolean;
};

export type ClockState = Record<
  UserId,
  {
    primary: ClockStageState;
    secondary: ClockStageState;
    consecutiveTimeouts: number;
    isPenalized: boolean;
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
  secondaryClockTime?: number;
  penaltyClockTime?: number;
  initiativeChangeBonusTime?: number;
  disabled: boolean;
};

const DEFAULT_CLOCK_TIME = 45 * 1000;
const DEFAULT_SECONDARY_CLOCK_TIME = 15 * 1000;
const DEFAULT_PENALTY_CLOCK_TIME = 5 * 1000;
const DEFAULT_INITIATIVE_CHANGE_BONUS_TIME = 5 * 1000;
const CONSECUTIVE_TIMEOUT_THRESHOLD = 2;

type PlayerClocks = {
  primary: Clock;
  secondary: Clock;
  consecutiveTimeouts: number;
  isPenalized: boolean;
};

export class ClockManager {
  private playerClocks = new Map<string, PlayerClocks>();
  private emitter = new TypedEventEmitter<ClockManagerEventMap>('parallel');
  private clockTime: number;
  private secondaryClockTime: number;
  private penaltyClockTime: number;
  private initiativeChangeBonusTime: number;
  private disabled: boolean;

  constructor(private options: ClockManagerOptions) {
    this.clockTime = options.clockTime ?? DEFAULT_CLOCK_TIME;
    this.secondaryClockTime = options.secondaryClockTime ?? DEFAULT_SECONDARY_CLOCK_TIME;
    this.penaltyClockTime = options.penaltyClockTime ?? DEFAULT_PENALTY_CLOCK_TIME;
    this.initiativeChangeBonusTime =
      options.initiativeChangeBonusTime ?? DEFAULT_INITIATIVE_CHANGE_BONUS_TIME;
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
      this.playerClocks.set(playerId, this.createPlayerClocks(playerId));
    }
  }

  shutdown() {
    this.playerClocks.forEach(clocks => {
      clocks.primary.shutdown();
      clocks.secondary.shutdown();
    });
    this.playerClocks.clear();
  }

  startClockForPlayer(playerId: string) {
    if (this.disabled) return;
    const clocks = this.playerClocks.get(playerId);
    if (!clocks) return;

    if (clocks.primary.isFinished && !clocks.secondary.isFinished) {
      clocks.secondary.start();
    } else if (!clocks.primary.isFinished) {
      clocks.primary.start();
    }
  }

  stopClockForPlayer(playerId: string) {
    if (this.disabled) return;
    const clocks = this.playerClocks.get(playerId);
    clocks?.primary.stop();
    clocks?.secondary.stop();
  }

  resetClockForPlayer(playerId: string) {
    if (this.disabled) return;
    const clocks = this.playerClocks.get(playerId);
    clocks?.primary.reset();
    clocks?.secondary.reset();
  }

  resetAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach(clocks => {
      clocks.primary.reset();
      clocks.secondary.reset();
    });
  }

  startAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach((_, playerId) => this.startClockForPlayer(playerId));
  }

  stopAllClocks() {
    if (this.disabled) return;
    this.playerClocks.forEach(clocks => {
      clocks.primary.stop();
      clocks.secondary.stop();
    });
  }

  resetSecondaryClockForPlayer(playerId: string) {
    if (this.disabled) return;
    this.playerClocks.get(playerId)?.secondary.reset();
  }

  addInitiativeChangeBonus(playerId: string) {
    if (this.disabled) return;
    this.playerClocks.get(playerId)?.primary.addTime(this.initiativeChangeBonusTime);
  }

  recordPlayerInput(playerId: string) {
    if (this.disabled) return;
    const clocks = this.playerClocks.get(playerId);
    if (!clocks) return;

    clocks.consecutiveTimeouts = 0;
    if (clocks.isPenalized) {
      clocks.isPenalized = false;
      this.replaceClocks(playerId, this.clockTime, this.secondaryClockTime);
      this.emitClocks();
    }
  }

  get clockState(): ClockState {
    return Object.fromEntries(
      Array.from(this.playerClocks.entries()).map(([userId, clocks]) => [
        userId,
        {
          primary: this.serializeClock(clocks.primary),
          secondary: this.serializeClock(clocks.secondary),
          consecutiveTimeouts: clocks.consecutiveTimeouts,
          isPenalized: clocks.isPenalized
        }
      ])
    );
  }

  private createPlayerClocks(
    playerId: string,
    primaryTime = this.clockTime,
    secondaryTime = this.secondaryClockTime
  ): PlayerClocks {
    const clocks: PlayerClocks = {
      primary: new Clock(primaryTime),
      secondary: new Clock(secondaryTime),
      consecutiveTimeouts: 0,
      isPenalized: false
    };

    clocks.primary.on('tick', () => this.emitClocks());
    clocks.secondary.on('tick', () => this.emitClocks());
    clocks.primary.on('timeout', () => {
      clocks.secondary.reset();
      clocks.secondary.start();
      this.emitClocks();
    });
    clocks.secondary.on('timeout', async () => {
      clocks.consecutiveTimeouts += 1;
      if (clocks.consecutiveTimeouts >= CONSECUTIVE_TIMEOUT_THRESHOLD) {
        clocks.isPenalized = true;
        this.replaceClocks(playerId, this.penaltyClockTime, this.penaltyClockTime);
      }
      await this.emitter.emit(CLOCK_MANAGER_EVENTS.TIMEOUT, { playerId });
      this.emitClocks();
    });

    return clocks;
  }

  private replaceClocks(playerId: string, primaryTime: number, secondaryTime: number) {
    const current = this.playerClocks.get(playerId);
    if (!current) return;

    const wasPrimaryRunning = current.primary.isRunning();
    const wasSecondaryRunning = current.secondary.isRunning();
    current.primary.shutdown();
    current.secondary.shutdown();
    const replacement = this.createPlayerClocks(playerId, primaryTime, secondaryTime);
    replacement.consecutiveTimeouts = current.consecutiveTimeouts;
    replacement.isPenalized = current.isPenalized;
    this.playerClocks.set(playerId, replacement);
    if (wasPrimaryRunning) replacement.primary.start();
    if (wasSecondaryRunning) replacement.secondary.start();
  }

  private serializeClock(clock: Clock): ClockStageState {
    const remaining = Math.round(clock.getRemainingTime() / 1000);
    return {
      max: Math.max(clock.maxDuration / 1000, remaining),
      remaining,
      isActive: clock.isRunning()
    };
  }

  private emitClocks() {
    void this.emitter.emit(CLOCK_MANAGER_EVENTS.TICK, this.clockState);
  }
}
