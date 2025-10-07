import { GAME_STATUS, type UserId, type GameId, type GameStatus } from '@game/api';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { Ioserver, IoSocket } from './io';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { EmptyObject } from '@game/shared';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { Clock } from './clock';

export type RoomOptions = {
  game: { id: GameId; status: GameStatus; players: Array<{ userId: string }> };
  initialState: GameOptions;
};

export const ROOM_EVENTS = {
  ALL_PLAYERS_JOINED: 'allPlayersJoined',
  INPUT_END: 'inputEnd'
} as const;

type RoomEventMap = {
  [ROOM_EVENTS.ALL_PLAYERS_JOINED]: EmptyObject;
  [ROOM_EVENTS.INPUT_END]: SerializedInput[];
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

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  async shutdown() {
    await this.engine.shutdown();
    this.players.forEach(player => {
      this.playerClocks.get(player.userId)!.actionClock.shutdown();
      this.playerClocks.get(player.userId)!.turnClock.shutdown();
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

    this.options.game.players.forEach(player => {
      const clocks = {
        turnClock: new Clock(PLAYER_TURN_CLOCK_TIME),
        actionClock: new Clock(PLAYER_ACTION_CLOCK_TIME)
      };
      clocks.turnClock.on('tick', remainingTime => {
        console.log(
          `[ROOM] Player ${player.userId} turn clock: ${(remainingTime / 1000).toFixed()}s remaining`
        );
      });
      clocks.actionClock.on('tick', remainingTime => {
        console.log(
          `[ROOM] Player ${player.userId} action clock: ${(remainingTime / 1000).toFixed()}s remaining`
        );
      });
      this.playerClocks.set(player.userId, clocks);

      clocks.turnClock.on('timeout', () => {
        clocks.turnClock.stop();
        clocks.actionClock.start();
      });
      clocks.actionClock.on('timeout', async () => {
        // @TODO implement auto surrender input on the engine side
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
      this.stopActivePlayerclock();
      this.options.game.players.forEach(player => {
        this.playerClocks.get(player.userId)!.turnClock.reset();
      });
      this.startActivePlayerclock();
    });
    this.engine.on(GAME_EVENTS.INPUT_START, () => {
      this.stopActivePlayerclock();
    });

    this.players.forEach(player => {
      this.handlePlayerSubscription(player.socket);
    });
    this.spectators.forEach(spectatorSocket => {
      this.handleSpectatorSubscription(spectatorSocket);
    });

    this.startActivePlayerclock();
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

    playerSocket.on('gameInput', async (input: SerializedInput) => {
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
      throw new Error('Only game players can join as players');
    }
    if (this.players.size >= this.options.game.players.length) {
      throw new Error('Room is full');
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
    const canSpectate = this.options.game.players.some(
      p => p.userId === socket.data.user.id
    );
    if (!canSpectate) {
      throw new Error('Players cannot join as spectators');
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
