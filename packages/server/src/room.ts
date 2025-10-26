import { GAME_STATUS, type UserId, type GameId, type GameStatus } from '@game/api';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { Ioserver, IoSocket } from './io';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { EmptyObject } from '@game/shared';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { Clock } from './clock';

export type RoomOptions = {
  game: {
    id: GameId;
    status: GameStatus;
    players: Array<{ userId: string }>;
    options: {
      disableTurnTimers: boolean;
      teachingMode: boolean;
    };
  };
  initialState: GameOptions;
};

export const ROOM_EVENTS = {
  ALL_PLAYERS_JOINED: 'allPlayersJoined',
  INPUT_END: 'inputEnd',
  GAME_OVER: 'gameOver',
  CLOCK_TICK: 'clockTick'
} as const;

type RoomEventMap = {
  [ROOM_EVENTS.ALL_PLAYERS_JOINED]: EmptyObject;
  [ROOM_EVENTS.INPUT_END]: SerializedInput[];
  [ROOM_EVENTS.GAME_OVER]: { winnerId: string | null };
  [ROOM_EVENTS.CLOCK_TICK]: Record<
    UserId,
    {
      turn: { max: number; remaining: number; isActive: boolean };
      action: { max: number; remaining: number; isActive: boolean };
    }
  >;
};

type RoomPlayer = {
  userId: string;
  socket: IoSocket;
};

const PLAYER_TURN_CLOCK_TIME = 90 * 1000;
const PLAYER_ACTION_CLOCK_TIME = 20 * 1000;

export class Room {
  private engine: Game;

  private playerClocks = new Map<string, { turnClock: Clock; actionClock: Clock }>();
  private players = new Map<string, RoomPlayer>();

  private spectators = new Set<IoSocket>();

  private emitter = new TypedEventEmitter<RoomEventMap>('parallel');

  private engineInitPromise: Promise<void> | null = null;

  constructor(
    readonly id: string,
    private io: Ioserver,
    private options: RoomOptions
  ) {
    this.engine = new Game(this.options.initialState);
  }

  get disableTurnTimers() {
    return this.options.game.options.disableTurnTimers;
  }

  get teachingMode() {
    return this.options.game.options.teachingMode;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  async shutdown() {
    await this.engine.shutdown();
    this.players.forEach(player => {
      this.playerClocks.get(player.userId)?.actionClock.shutdown();
      this.playerClocks.get(player.userId)?.turnClock.shutdown();
    });
  }

  initializeEngine() {
    if (!this.engineInitPromise) {
      this.engineInitPromise = this.engine.initialize();
    }
    return this.engineInitPromise;
  }

  private startActivePlayerclock() {
    const activePlayerId = this.engine.activePlayer.id;

    const clockToRun = this.playerClocks.get(activePlayerId)!.turnClock.isFinished
      ? this.playerClocks.get(activePlayerId)!.actionClock
      : this.playerClocks.get(activePlayerId)!.turnClock;
    clockToRun.start();
  }

  private stopActivePlayerclock() {
    const activePlayerId = this.engine.activePlayer.id;
    const clockToStop = this.playerClocks.get(activePlayerId)!.turnClock.isRunning()
      ? this.playerClocks.get(activePlayerId)!.turnClock
      : this.playerClocks.get(activePlayerId)!.actionClock;
    clockToStop?.stop();
  }

  async start() {
    console.log('[ROOM] Starting room ', this.id);
    await this.initializeEngine();
    console.log('[ROOM] engine initialized ', this.id);

    this.engine.on(GAME_EVENTS.INPUT_END, async () => {
      await this.emitter.emit(ROOM_EVENTS.INPUT_END, this.engine.inputSystem.serialize());
    });

    this.engine.on(GAME_EVENTS.GAME_OVER, async event => {
      const winnerId = event.data.winners.length > 1 ? null : event.data.winners[0].id;
      await this.emitter.emit(ROOM_EVENTS.GAME_OVER, { winnerId });
    });

    this.players.forEach(player => {
      this.handlePlayerSubscription(player.socket);
    });

    this.spectators.forEach(spectatorSocket => {
      this.handleSpectatorSubscription(spectatorSocket);
    });

    if (!this.disableTurnTimers) {
      this.handleClocks();
      this.startActivePlayerclock();
    }
  }

  private handleClocks() {
    this.options.game.players.forEach(player => {
      const clocks = {
        turnClock: new Clock(PLAYER_TURN_CLOCK_TIME),
        actionClock: new Clock(PLAYER_ACTION_CLOCK_TIME)
      };
      this.playerClocks.set(player.userId, clocks);

      clocks.turnClock.on('tick', this.emitClocks.bind(this));
      clocks.actionClock.on('tick', this.emitClocks.bind(this));

      clocks.turnClock.on('timeout', () => {
        clocks.turnClock.stop();
        clocks.actionClock.start();
      });
      clocks.actionClock.on('timeout', async () => {
        await this.engine.inputSystem.dispatch({
          type: 'surrender',
          payload: { playerId: player.userId }
        });
      });
    });

    this.engine.onActivePlayerChange(() => {
      this.options.game.players.forEach(player => {
        this.playerClocks.get(player.userId)!.actionClock.reset();
      });
      this.stopActivePlayerclock();
      this.startActivePlayerclock();
    });

    this.engine.on(GAME_EVENTS.TURN_START, () => {
      this.options.game.players.forEach(player => {
        this.playerClocks.get(player.userId)!.turnClock.reset();
      });
      this.stopActivePlayerclock();
      this.startActivePlayerclock();
    });
    this.engine.on(GAME_EVENTS.INPUT_START, () => {
      this.stopActivePlayerclock();
    });
  }

  private emitClocks() {
    void this.emitter.emit(ROOM_EVENTS.CLOCK_TICK, {
      ...Object.fromEntries(
        Array.from(this.playerClocks.entries()).map(
          ([userId, { turnClock, actionClock }]) => [
            userId,
            {
              turn: {
                max: PLAYER_TURN_CLOCK_TIME / 1000,
                remaining: Math.round(turnClock.getRemainingTime() / 1000),
                isActive: turnClock.isRunning()
              },
              action: {
                max: PLAYER_ACTION_CLOCK_TIME / 1000,
                remaining: Math.round(actionClock.getRemainingTime() / 1000),
                isActive: actionClock.isRunning()
              }
            }
          ]
        )
      )
    });
  }

  private handleSpectatorSubscription(spectatorSocket: IoSocket) {
    const state = this.engine.snapshotSystem.getLatestOmniscientSnapshot();
    spectatorSocket.emit('gameInitialState', {
      snapshot: state,
      history: this.engine.inputSystem.serialize()
    });
    this.engine.subscribeOmniscient(snapshot => {
      spectatorSocket.emit('gameSnapshot', snapshot);
    });
  }

  private handlePlayerSubscription(playerSocket: IoSocket) {
    if (this.teachingMode) {
      const state = this.engine.snapshotSystem.getLatestOmniscientSnapshot();
      playerSocket.emit('gameInitialState', {
        snapshot: state,
        history: this.engine.inputSystem.serialize()
      });

      this.engine.subscribeOmniscient(snapshot => {
        playerSocket.emit('gameSnapshot', snapshot);
      });
    } else {
      const state = this.engine.snapshotSystem.getLatestSnapshotForPlayer(
        playerSocket.data.user.id
      );
      playerSocket.emit('gameInitialState', {
        snapshot: state,
        history: this.engine.inputSystem.serialize()
      });

      this.engine.subscribeForPlayer(playerSocket.data.user.id, snapshot => {
        playerSocket.emit('gameSnapshot', snapshot);
      });
    }

    playerSocket.on('gameInput', async (input: SerializedInput) => {
      console.log(input);
      input.payload.playerId = playerSocket.data.user.id; // Ensure playerId is set correctly to prevent cheating
      await this.engine.inputSystem.dispatch(input);
    });
  }

  async join(socket: IoSocket, type: 'spectator' | 'player') {
    if (type === 'spectator') {
      await this.joinAsSpectator(socket);
    } else {
      await this.joinAsPlayer(socket);
    }
  }

  async leave(socket: IoSocket) {
    if (this.players.has(socket.data.user.id)) {
      this.players.delete(socket.data.user.id);
      await socket.leave(this.id);
    }
    if (this.spectators.has(socket)) {
      this.spectators.delete(socket);
      await socket.leave(this.id);
    }
  }

  private async joinAsPlayer(socket: IoSocket) {
    const canPlay = this.options.game.players.some(p => p.userId === socket.data.user.id);
    if (!canPlay) {
      console.error('Room is full, cannot join as player');
      return;
    }
    if (this.players.size >= this.options.game.players.length) {
      console.error('Room is full, cannot join as player');
      return;
    }

    await socket.join(this.id);
    const roomPlayer = {
      userId: socket.data.user.id,
      socket
    };

    this.players.set(socket.data.user.id, roomPlayer);

    socket.on('disconnect', async () => {
      await this.leave(socket);
    });

    if (this.options.game.status === GAME_STATUS.ONGOING) {
      this.handlePlayerSubscription(socket);
    }

    const isReady =
      this.players.size === this.options.game.players.length &&
      this.options.game.status === GAME_STATUS.WAITING_FOR_PLAYERS;

    if (isReady) {
      await this.emitter.emit('allPlayersJoined', {});
    }
  }

  private async joinAsSpectator(socket: IoSocket) {
    const canSpectate = this.options.game.players.every(
      p => p.userId !== socket.data.user.id
    );
    if (!canSpectate) {
      console.log('User is a player, cannot spectate');
      return;
    }
    await socket.join(this.id);
    this.spectators.add(socket);

    socket.on('disconnect', async () => {
      await this.leave(socket);
    });

    if (this.options.game.status === GAME_STATUS.ONGOING) {
      this.handleSpectatorSubscription(socket);
    }
  }

  updateStatus(status: GameStatus) {
    this.options.game.status = status;
  }
}
