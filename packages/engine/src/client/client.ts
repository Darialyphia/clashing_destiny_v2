import type { BetterExtract, MaybePromise, Values } from '@game/shared';
import type { InputDispatcher } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../game/systems/game-snapshot.system';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { FxController } from './controllers/fx-controller';
import { ClientStateController } from './controllers/state-controller';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  PlayerViewModel | CardViewModel | ModifierViewModel
>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (
    lastSnapshotId: number
  ) => Promise<
    Array<GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>>
  >;
};

export type GameClientOptions = {
  adapter: NetworkAdapter;
} & (
  | {
      gameType: BetterExtract<GameType, 'local'>;
      initialState: SerializedOmniscientState;
      playerId?: never;
    }
  | {
      gameType: BetterExtract<GameType, 'online'>;
      initialState: SerializedPlayerState;
      playerId: string;
    }
);

export class GameClient {
  readonly fx = new FxController();

  readonly state: ClientStateController;

  private adapter: NetworkAdapter;

  private gameType: GameType;

  private initialState: SerializedOmniscientState | SerializedPlayerState;

  private playerId?: string;

  private lastSnapshotId = -1;

  private _isPlayingFx = false;

  private _isReady = false;

  private _processingUpdate = false;

  private queue: Array<
    GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  > = [];

  constructor(options: GameClientOptions) {
    this.adapter = options.adapter;
    this.state = new ClientStateController(options.initialState, this.adapter);
    this.gameType = options.gameType;
    this.initialState = options.initialState;
    this.playerId = options.playerId;

    this.adapter.subscribe(async snapshot => {
      this.queue.push(snapshot);
      if (this._processingUpdate) return;
      await this.processQueue();
    });
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get isReady() {
    return this._isReady;
  }

  private async processQueue() {
    if (this._processingUpdate || this.queue.length === 0) {
      console.warn('Already processing updates or queue is empty, skipping processing.');
      return;
    }

    this._processingUpdate = true;

    while (this.queue.length > 0) {
      const snapshot = this.queue.shift();
      await this.update(snapshot!);
    }

    this._processingUpdate = false;
  }

  async update(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  ) {
    if (snapshot.id <= this.lastSnapshotId) {
      console.log(
        `Stale snapshot, latest is ${this.lastSnapshotId}, received is ${snapshot.id}`
      );
      this.queue = [];
      await this.sync();
      return;
    }

    this.lastSnapshotId = snapshot.id;

    try {
      this._isPlayingFx = true;

      for (const event of snapshot.events) {
        await this.fx.emit(event.eventName, event.event);
      }
      this._isPlayingFx = false;

      if (this.gameType === GAME_TYPES.LOCAL) {
        this.playerId = snapshot.state.turnPlayer;
      }

      this._isReady = true;
    } catch (err) {
      console.error(err);
    }
  }

  private async sync() {
    const snapshots = await this.adapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }
}
