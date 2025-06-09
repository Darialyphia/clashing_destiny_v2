import type { EmptyObject, MaybePromise, Values } from '@game/shared';
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
import { UiController } from './controllers/ui-controller';
import { TypedEventEmitter } from '../utils/typed-emitter';
import { GAME_PHASES } from '../game/game.enums';
import { COMBAT_STEPS } from '../game/phases/combat.phase';

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
  gameType: GameType;
  playerId: string;
};

export class GameClient {
  readonly fx = new FxController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly adapter: NetworkAdapter;

  private gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<
    GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  > = [];

  private emitter = new TypedEventEmitter<{ update: EmptyObject }>('sequential');

  constructor(options: GameClientOptions) {
    this.adapter = options.adapter;
    this.stateManager = new ClientStateController(this);
    this.ui = new UiController(this);
    this.gameType = options.gameType;
    this.playerId = options.playerId;

    this.adapter.subscribe(async snapshot => {
      console.groupCollapsed(`Snapshot Update: ${snapshot.id}`);
      console.log('state', snapshot.state);
      console.log('events', snapshot.events);
      console.groupEnd();
      this.queue.push(snapshot);
      if (this._processingUpdate) return;
      await this.processQueue();
    });
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get state() {
    return this.stateManager.state;
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

  getActivePlayerIdFromSnapshotState(
    snapshot: SerializedOmniscientState | SerializedPlayerState
  ) {
    if (snapshot.effectChain) {
      return snapshot.effectChain.player;
    }

    if (
      snapshot.phase.state === GAME_PHASES.ATTACK &&
      snapshot.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER
    ) {
      return snapshot.players.find(id => id !== snapshot.turnPlayer)!;
    }

    return snapshot.interaction.ctx.player;
  }

  getActivePlayerId() {
    if (this.stateManager.state.effectChain) {
      return this.stateManager.state.effectChain.player;
    }

    if (
      this.stateManager.state.phase.state === GAME_PHASES.ATTACK &&
      this.stateManager.state.phase.ctx.step === COMBAT_STEPS.DECLARE_BLOCKER
    ) {
      return this.stateManager.state.players.find(
        id => id !== this.stateManager.state.turnPlayer
      )!;
    }

    return this.stateManager.state.interaction.ctx.player;
  }

  initialize(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  ) {
    this.lastSnapshotId = snapshot.id;
    this.initialState = snapshot.state;

    this.stateManager.initialize(snapshot.state);

    if (this.gameType === GAME_TYPES.LOCAL) {
      this.playerId = this.getActivePlayerId();
    }

    this.isReady = true;
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
        if (this.gameType === GAME_TYPES.LOCAL) {
          this.playerId = this.getActivePlayerIdFromSnapshotState(snapshot.state);
          await this.emitter.emit('update', {});
        }
        await this.fx.emit(event.eventName, event.event);
      }
      this._isPlayingFx = false;

      this.stateManager.update(snapshot.state);

      if (this.gameType === GAME_TYPES.LOCAL) {
        this.playerId = this.getActivePlayerId();
      }

      this.ui.update();

      await this.emitter.emit('update', {});
    } catch (err) {
      console.error(err);
    }
  }

  onUpdate(cb: () => void) {
    this.emitter.on('update', cb);
  }

  private async sync() {
    const snapshots = await this.adapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }
}
