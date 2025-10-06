import { GAME_STATUS, type GameId, type GameStatus } from '@game/api';
import { Game, type GameOptions } from '@game/engine/src/game/game';
import type { Ioserver, IoSocket } from './io';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import type { EmptyObject } from '@game/shared';
import type { SerializedInput } from '@game/engine/src/input/input-system';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

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

export class Room {
  private engine: Game;

  private players = new Set<IoSocket>();

  private spectators = new Set<IoSocket>();

  private emitter = new TypedEventEmitter<RoomEventMap>('parallel');

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
  }

  async start() {
    await this.engine.initialize();

    this.engine.on(GAME_EVENTS.INPUT_END, async () => {
      await this.emitter.emit(ROOM_EVENTS.INPUT_END, this.engine.inputSystem.serialize());
    });

    this.players.forEach(playerSocket => {
      this.handlePlayersubscription(playerSocket);
    });
    this.spectators.forEach(spectatorSocket => {
      this.handleSpectatorSubscription(spectatorSocket);
    });
  }

  private handleSpectatorSubscription(spectatorSocket: IoSocket) {
    const state = this.engine.snapshotSystem.getLatestOmniscientSnapshot();
    spectatorSocket.emit('gameInitialState', state);
    this.engine.subscribeOmniscient(snapshot => {
      spectatorSocket.emit('gameSnapshot', snapshot);
    });
  }

  private handlePlayersubscription(playerSocket: IoSocket) {
    const state = this.engine.snapshotSystem.getLatestSnapshotForPlayer(
      playerSocket.data.user.id
    );
    playerSocket.emit('gameInitialState', state);

    this.engine.subscribeForPlayer(playerSocket.data.user.id, snapshot => {
      playerSocket.emit('gameSnapshot', snapshot);
    });
  }

  async join(socket: IoSocket, type: 'spectator' | 'player') {
    if (type === 'spectator') {
      await this.joinAsSpectator(socket);
    } else {
      await this.joinAsPlayer(socket);
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
    this.players.add(socket);

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
  }

  updateStatus(status: GameStatus) {
    this.options.game.status = status;
  }
}
