import { EventEmitter } from 'events';

export interface ClockEvents {
  tick: (remainingTime: number) => void;
  timeout: () => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export class Clock extends EventEmitter {
  constructor(maxTime: number) {
    super();
    this.maxTime = maxTime;
    this.remainingTime = maxTime;
  }

  private maxTime: number;
  private startTime: number | null = null;
  private remainingTime: number;
  private tickInterval: NodeJS.Timeout | null = null;
  private hasTimedOut = false;

  start() {
    if (this.isRunning()) return; // Already running

    this.startTime = performance.now();
    this.hasTimedOut = false;
    this.emit('start');
    this.startTickInterval();
  }

  stop() {
    if (this.startTime !== null) {
      this.remainingTime -= performance.now() - this.startTime;
      this.startTime = null;
      this.emit('stop');
    }
    this.stopTickInterval();
  }

  reset() {
    this.stop();
    this.remainingTime = this.maxTime;
    this.hasTimedOut = false;
    this.emit('reset');
  }

  getRemainingTime() {
    if (this.startTime !== null) {
      return Math.max(this.remainingTime - (performance.now() - this.startTime), 0);
    }
    return Math.max(this.remainingTime, 0);
  }

  get isFinished() {
    return this.getRemainingTime() <= 0;
  }

  isRunning(): boolean {
    return this.startTime !== null;
  }

  private startTickInterval() {
    this.stopTickInterval(); // Ensure no duplicate intervals

    this.tickInterval = setInterval(() => {
      const currentRemainingTime = this.getRemainingTime();

      this.emit('tick', currentRemainingTime);

      // Check if time has run out
      if (currentRemainingTime <= 0 && !this.hasTimedOut) {
        this.hasTimedOut = true;
        this.stop();
        this.emit('timeout');
      }
    }, 1000); // Emit every second
  }

  private stopTickInterval() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  shutdown() {
    this.stop();
    this.removeAllListeners();
  }

  on<K extends keyof ClockEvents>(event: K, listener: ClockEvents[K]): this {
    return super.on(event, listener);
  }

  once<K extends keyof ClockEvents>(event: K, listener: ClockEvents[K]): this {
    return super.once(event, listener);
  }

  emit<K extends keyof ClockEvents>(
    event: K,
    ...args: Parameters<ClockEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}
