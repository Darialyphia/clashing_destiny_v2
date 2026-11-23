import { GAME_STATUS, type GameId, type GameStatus } from '@game/api';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { Ioserver, IoSocket } from '../io';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { EmptyObject } from '@game/shared';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { consoleLogger } from '@game/engine/src/utils/logger';
import type { ClockState } from './clock-manager';
import { TurnTimers } from './turn-timers';
import { SocketDisposables } from './socket-disposables';
import { RoomMembership, type RoomMemberType } from './room-membership';
import { attachInputRelay, attachViewer, type SnapshotViewer } from './snapshot-stream';

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

const PLAYER_ACTION_CLOCK_TIME = 60 * 1000;

export class Room {
  private engine: Game;

  private turnTimers: TurnTimers;

  private disposables = new SocketDisposables();

  private membership: RoomMembership;

  private emitter = new TypedEventEmitter<RoomEventMap>('parallel');

  private engineInitPromise: Promise<void> | null = null;

  private hasStarted = false;

  // set once the engine is initialized: from then on, every member receives the game snapshots
  private isLive = false;

  private streamingSockets = new Set<IoSocket>();

  constructor(
    readonly id: string,
    private io: Ioserver,
    private options: RoomOptions
  ) {
    const playerIds = this.options.game.players.map(p => p.userId);

    this.engine = new Game(this.options.initialState);
    this.engine.logger.addLogger(consoleLogger);
    this.turnTimers = new TurnTimers(this.engine, {
      playerIds,
      clockTime: PLAYER_ACTION_CLOCK_TIME,
      disabled: this.options.game.options.disableTurnTimers
    });
    this.membership = new RoomMembership(this.id, playerIds, this.disposables);
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

  initializeEngine() {
    if (!this.engineInitPromise) {
      this.engineInitPromise = this.engine.initialize();
    }
    return this.engineInitPromise;
  }

  async start() {
    if (this.hasStarted) return;
    this.hasStarted = true;

    console.log('[ROOM] Starting room ', this.id);
    await this.initializeEngine();
    console.log('[ROOM] engine initialized ', this.id);

    this.forwardEngineEvents();

    this.isLive = true;
    this.membership.members.forEach(({ socket, type }) => {
      this.startStreaming(socket, type);
    });

    this.turnTimers.onTick(async clockState => {
      await this.emitter.emit(ROOM_EVENTS.CLOCK_TICK, clockState);
    });
    this.turnTimers.start();
  }

  async shutdown() {
    await this.engine.shutdown();
    this.turnTimers.shutdown();
    this.disposables.disposeAll();
    this.io.in(this.id).disconnectSockets();
  }

  async join(socket: IoSocket, type: RoomMemberType) {
    const hasJoined =
      type === 'player'
        ? await this.membership.addPlayer(socket)
        : await this.membership.addSpectator(socket);
    if (!hasJoined) return;

    if (this.isLive) {
      this.startStreaming(socket, type);
    }

    const isReady =
      type === 'player' &&
      this.membership.isFull &&
      this.options.game.status === GAME_STATUS.WAITING_FOR_PLAYERS;

    if (isReady) {
      await this.emitter.emit(ROOM_EVENTS.ALL_PLAYERS_JOINED, {});
    }
  }

  async leave(socket: IoSocket) {
    await this.membership.remove(socket);
  }

  updateStatus(status: GameStatus) {
    this.options.game.status = status;
  }

  private forwardEngineEvents() {
    this.engine.on(GAME_EVENTS.INPUT_END, async () => {
      await this.emitter.emit(ROOM_EVENTS.INPUT_END, this.engine.inputSystem.serialize());
    });

    this.engine.on(GAME_EVENTS.GAME_OVER, async event => {
      const winnerId = event.data.winners.length > 1 ? null : event.data.winners[0].id;
      await this.emitter.emit(ROOM_EVENTS.GAME_OVER, { winnerId });
    });
  }

  private startStreaming(socket: IoSocket, type: RoomMemberType) {
    // a socket joining while the room goes live can be reached both by start() and join()
    if (this.streamingSockets.has(socket)) return;
    // the socket may have disconnected while join() was waiting
    if (!this.membership.has(socket)) return;

    this.streamingSockets.add(socket);
    this.disposables.add(socket, () => this.streamingSockets.delete(socket));
    this.disposables.add(
      socket,
      attachViewer(this.engine, socket, this.viewerFor(socket, type))
    );

    if (type === 'player') {
      this.disposables.add(
        socket,
        attachInputRelay(this.engine, this.turnTimers, socket, socket.data.user.id)
      );
    }
  }

  private viewerFor(socket: IoSocket, type: RoomMemberType): SnapshotViewer {
    if (type === 'spectator' || this.teachingMode) {
      return { kind: 'omniscient' };
    }
    return { kind: 'player', playerId: socket.data.user.id };
  }
}
