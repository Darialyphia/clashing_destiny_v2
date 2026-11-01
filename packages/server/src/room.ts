import { GAME_STATUS, type GameId, type GameStatus } from '@game/api';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { Ioserver, IoSocket } from './io';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { EmptyObject } from '@game/shared';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { consoleLogger } from '@game/engine/src/utils/logger';
import { ClockManager, CLOCK_MANAGER_EVENTS, type ClockState } from './clock-manager';

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
  [ROOM_EVENTS.CLOCK_TICK]: ClockState;
};

type RoomPlayer = {
  userId: string;
  socket: IoSocket;
};

const PLAYER_ACTION_CLOCK_TIME = 60 * 1000;

export class Room {
  private engine: Game;

  private clockManager: ClockManager;
  private players = new Map<string, RoomPlayer>();
  private activePlayerIds = new Set<string>();

  private spectators = new Set<IoSocket>();

  private emitter = new TypedEventEmitter<RoomEventMap>('parallel');

  private engineInitPromise: Promise<void> | null = null;

  private hasStarted = false;

  // listeners registered for each socket, removed when the socket leaves the room
  private socketCleanups = new Map<IoSocket, Array<() => void>>();

  constructor(
    readonly id: string,
    private io: Ioserver,
    private options: RoomOptions
  ) {
    this.engine = new Game(this.options.initialState);
    this.engine.logger.addLogger(consoleLogger);
    this.clockManager = new ClockManager({
      playerIds: this.options.game.players.map(p => p.userId),
      clockTime: PLAYER_ACTION_CLOCK_TIME,
      disabled: this.options.game.options.disableTurnTimers
    });
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
    this.clockManager.shutdown();

    for (const socket of [...this.socketCleanups.keys()]) {
      this.cleanupSocket(socket);
    }

    this.io.in(this.id).disconnectSockets();
  }

  private addSocketCleanup(socket: IoSocket, cleanup: () => void) {
    if (!this.socketCleanups.has(socket)) {
      this.socketCleanups.set(socket, []);
    }
    this.socketCleanups.get(socket)!.push(cleanup);
  }

  private cleanupSocket(socket: IoSocket) {
    this.socketCleanups.get(socket)?.forEach(cleanup => cleanup());
    this.socketCleanups.delete(socket);
  }

  initializeEngine() {
    if (!this.engineInitPromise) {
      this.engineInitPromise = this.engine.initialize();
    }
    return this.engineInitPromise;
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

  async start() {
    if (this.hasStarted) return;
    this.hasStarted = true;

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

    this.initializeClocks();
    this.syncActivePlayerClocks();
  }

  private initializeClocks() {
    this.clockManager.initialize();

    this.clockManager.on(CLOCK_MANAGER_EVENTS.TICK, async clockState => {
      await this.emitter.emit(ROOM_EVENTS.CLOCK_TICK, clockState);
    });

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
  }

  private handleSpectatorSubscription(spectatorSocket: IoSocket) {
    const state = this.engine.snapshotSystem.getLatestOmniscientSnapshot();
    spectatorSocket.emit('gameInitialState', {
      snapshot: state,
      history: this.engine.inputSystem.serialize()
    });
    this.addSocketCleanup(
      spectatorSocket,
      this.engine.subscribeOmniscient(snapshot => {
        spectatorSocket.emit('gameSnapshot', snapshot);
      })
    );
  }

  private handlePlayerSubscription(playerSocket: IoSocket) {
    if (this.teachingMode) {
      const state = this.engine.snapshotSystem.getLatestOmniscientSnapshot();
      playerSocket.emit('gameInitialState', {
        snapshot: state,
        history: this.engine.inputSystem.serialize()
      });

      this.addSocketCleanup(
        playerSocket,
        this.engine.subscribeOmniscient(snapshot => {
          playerSocket.emit('gameSnapshot', snapshot);
        })
      );
    } else {
      const state = this.engine.snapshotSystem.getLatestSnapshotForPlayer(
        playerSocket.data.user.id
      );
      playerSocket.emit('gameInitialState', {
        snapshot: state,
        history: this.engine.inputSystem.serialize()
      });

      this.addSocketCleanup(
        playerSocket,
        this.engine.subscribeForPlayer(playerSocket.data.user.id, snapshot => {
          playerSocket.emit('gameSnapshot', snapshot);
        })
      );
    }

    const onInput = async (input: SerializedInput) => {
      this.clockManager.recordPlayerInput(playerSocket.data.user.id);
      input.payload.playerId = playerSocket.data.user.id; // Ensure playerId is set correctly to prevent cheating
      await this.engine.inputSystem.dispatch(input);
    };
    playerSocket.on('gameInput', onInput);
    this.addSocketCleanup(playerSocket, () => playerSocket.off('gameInput', onInput));
  }

  async join(socket: IoSocket, type: 'spectator' | 'player') {
    if (type === 'spectator') {
      await this.joinAsSpectator(socket);
    } else {
      await this.joinAsPlayer(socket);
    }
  }

  async leave(socket: IoSocket) {
    // a reconnected player may already have replaced this socket
    if (this.players.get(socket.data.user.id)?.socket === socket) {
      this.players.delete(socket.data.user.id);
    }
    this.spectators.delete(socket);
    this.cleanupSocket(socket);
    await socket.leave(this.id);
  }

  private async joinAsPlayer(socket: IoSocket) {
    const canPlay = this.options.game.players.some(p => p.userId === socket.data.user.id);
    if (!canPlay) {
      console.error('Room is full, cannot join as player');
      return;
    }

    const previousSocket = this.players.get(socket.data.user.id)?.socket;
    if (previousSocket === socket) return;
    // the player reconnected before the server noticed their previous socket was gone
    if (previousSocket) {
      await this.leave(previousSocket);
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

    const onDisconnect = async () => {
      await this.leave(socket);
    };
    socket.on('disconnect', onDisconnect);
    this.addSocketCleanup(socket, () => socket.off('disconnect', onDisconnect));

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

    const onDisconnect = async () => {
      await this.leave(socket);
    };
    socket.on('disconnect', onDisconnect);
    this.addSocketCleanup(socket, () => socket.off('disconnect', onDisconnect));

    if (this.options.game.status === GAME_STATUS.ONGOING) {
      this.handleSpectatorSubscription(socket);
    }
  }

  updateStatus(status: GameStatus) {
    this.options.game.status = status;
  }
}
