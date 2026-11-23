import type { Game } from '@game/engine/src/game/game';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { ClockManager, CLOCK_MANAGER_EVENTS, type ClockState } from './clock-manager';

export type TurnTimersOptions = {
  playerIds: string[];
  clockTime: number;
  disabled: boolean;
};

/**
 * The players' turn timers, driven by the game state:
 * - only the active players' clocks run
 * - clocks reset at the start of each turn
 * - losing the initiative grants a time bonus
 * - a clock timeout is dispatched to the engine as an input
 *
 * The timer mechanics themselves (secondary clock, penalties...) live in ClockManager.
 */
export class TurnTimers {
  private clockManager: ClockManager;

  private activePlayerIds = new Set<string>();

  constructor(
    private engine: Game,
    private options: TurnTimersOptions
  ) {
    this.clockManager = new ClockManager({
      playerIds: options.playerIds,
      clockTime: options.clockTime
    });
  }

  onTick(cb: (state: ClockState) => void | Promise<void>) {
    return this.clockManager.on(CLOCK_MANAGER_EVENTS.TICK, cb);
  }

  start() {
    if (this.options.disabled) return;

    this.clockManager.initialize();

    this.clockManager.on(CLOCK_MANAGER_EVENTS.TIMEOUT, async ({ playerId }) => {
      await this.engine.inputSystem.dispatch({
        type: 'interactionTimeout',
        payload: { playerId }
      });
    });

    this.engine.onActivePlayerChange(() => {
      this.syncActivePlayerClocks(true);
    });

    this.engine.on(GAME_EVENTS.TURN_INITATIVE_CHANGE, event => {
      this.clockManager.addInitiativeChangeBonus(event.data.oldInitiativePlayer.id);
    });

    this.engine.on(GAME_EVENTS.TURN_START, () => {
      this.clockManager.resetAllClocks();
      this.syncActivePlayerClocks();
    });

    this.syncActivePlayerClocks();
  }

  recordPlayerInput(playerId: string) {
    this.clockManager.recordPlayerInput(playerId);
  }

  shutdown() {
    this.clockManager.shutdown();
  }

  private syncActivePlayerClocks(resetSecondary = false) {
    const nextActivePlayerIds = new Set(
      this.engine.activePlayers.map(player => player.id)
    );

    for (const playerId of this.activePlayerIds) {
      if (!nextActivePlayerIds.has(playerId)) {
        this.clockManager.stopClockForPlayer(playerId);
      }
    }

    for (const playerId of nextActivePlayerIds) {
      if (resetSecondary && !this.activePlayerIds.has(playerId)) {
        this.clockManager.resetSecondaryClockForPlayer(playerId);
      }
      this.clockManager.startClockForPlayer(playerId);
    }

    this.activePlayerIds = nextActivePlayerIds;
  }
}
