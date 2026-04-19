import {
  isDefined,
  type EmptyObject,
  type MaybePromise,
  type Point,
  type Values
} from '@game/shared';
import type { InputDispatcher, SerializedInput } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState,
  PatchBasedSnapshotDiff,
  SnapshotDiff
} from '../game/systems/game-snapshot.system';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { FxController } from './controllers/fx-controller';
import { ClientStateController } from './controllers/state-controller';
import { UiController } from './controllers/ui-controller';
import { TypedEventEmitter } from '../utils/typed-emitter';
import type { BoardCellViewModel } from './view-models/board-cell.model';
import type { UnitViewModel } from './view-models/unit.model';
import type { TileViewModel } from './view-models/tile.model';
import { GAME_PHASES } from '../game/game.enums';
import { VFXSequenceController } from './controllers/vfx-sequence.controller';
import type { AbilityViewModel } from './view-models/ability.model';
import { PatchApplier } from './patch-applier';
import type { ArtifactViewModel } from './view-models/artifact.model';
import { GAME_EVENTS } from '../game/game.events';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  | PlayerViewModel
  | CardViewModel
  | ModifierViewModel
  | BoardCellViewModel
  | UnitViewModel
  | TileViewModel
  | AbilityViewModel
  | ArtifactViewModel
>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<SnapshotDiff>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (lastSnapshotId: number) => Promise<Array<GameStateSnapshot<SnapshotDiff>>>;
};

export type FxAdapter = {
  onDeclarePlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onCancelPlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
};

export type GameClientOptions = {
  networkAdapter: NetworkAdapter;
  fxAdapter: FxAdapter;
  gameType: GameType;
  playerId: string;
  isSpectator: boolean;
};

export class GameClient {
  readonly fx = new FxController();

  readonly vfx = new VFXSequenceController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly fxAdapter: FxAdapter;

  readonly gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<number, GameStateSnapshot<SnapshotDiff>>();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<GameStateSnapshot<SnapshotDiff>> = [];

  history: SerializedInput[] = [];

  readonly patchApplier = new PatchApplier();

  private emitter = new TypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<SnapshotDiff>;
  }>('sequential');

  readonly isSpectator: boolean = false;
  constructor(options: GameClientOptions) {
    this.networkAdapter = options.networkAdapter;
    this.fxAdapter = options.fxAdapter;
    this.stateManager = new ClientStateController(this);
    this.ui = new UiController(this);
    this.gameType = options.gameType;
    this.playerId = options.playerId;
    this.isSpectator = options.isSpectator;

    this.networkAdapter.subscribe(async snapshot => {
      console.groupCollapsed(`Snapshot Update: ${snapshot.id}`);
      if (snapshot.kind === 'state') {
        console.log('state', snapshot.state);
      }
      console.log('events', snapshot.events);
      console.groupEnd();
      this.queue.push(snapshot);
      if (this._processingUpdate || !this.isReady) return;
      await this.processQueue();
    });

    this.cancelPlayCard = this.cancelPlayCard.bind(this);
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get state() {
    return this.stateManager.state;
  }

  get player() {
    return this.stateManager.state.entities[this.playerId] as PlayerViewModel;
  }

  get nextSnapshotId() {
    return this.lastSnapshotId + 1;
  }

  dispatch(input: SerializedInput) {
    this.history.push(input);
    this.networkAdapter.dispatch(input);
  }

  private async processQueue() {
    if (!this.isReady) {
      console.warn('Waiting for game client to be ready to process queue...');
      return;
    }
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
    return snapshot.interaction.ctx.player;
  }

  getActivePlayerId() {
    return this.stateManager.state.interaction.ctx.player;
  }

  async initialize(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>,
    history: SerializedInput[] = []
  ) {
    this.isReady = false;
    this.history = history;
    this.lastSnapshotId = -1;
    this.snapshots.clear();
    this.queue = [];
    if (snapshot.kind === 'error') {
      throw new Error('Cannot initialize client with error snapshot');
    }

    this.lastSnapshotId = snapshot.id;
    this.initialState = snapshot.state;

    this.stateManager.initialize(snapshot.state);

    this.isReady = true;
    if (this.queue.length > 0) {
      await this.processQueue();
    }
  }

  async onInvalidSnapshot() {
    this.queue = [];
    await this.sync();
  }

  async update(snapshot: GameStateSnapshot<SnapshotDiff>) {
    if (snapshot.id <= this.lastSnapshotId) {
      console.log(
        `Stale snapshot, latest is ${this.lastSnapshotId}, received is ${snapshot.id}. skipping`
      );
      return;
    }

    if (snapshot.id > this.nextSnapshotId) {
      console.warn(
        `Missing snapshots, latest is ${this.lastSnapshotId}, received is ${snapshot.id}`
      );
      return await this.onInvalidSnapshot();
    }

    this.lastSnapshotId = snapshot.id;

    try {
      this._isPlayingFx = true;
      const isStateSnapshot = snapshot.kind === 'state';
      if (isStateSnapshot) {
        this.stateManager.preupdate(snapshot.state);
      }

      for (const event of snapshot.events) {
        await this.stateManager.onEvent(event, async postUpdateCallback => {
          await this.emitter.emit('update', {});
          await postUpdateCallback?.();
        });

        if (event.eventName === GAME_EVENTS.VFX_PLAY_SEQUENCE) {
          await this.vfx.playSequence(event.event.sequence);
        }

        await this.fx.emit(event.eventName, event.event);
      }
      this._isPlayingFx = false;

      if (isStateSnapshot) {
        this.stateManager.update(snapshot.state);
      }

      this.ui.update();
      this.snapshots.set(snapshot.id, snapshot);
      await this.emitter.emit('update', {});
      await this.emitter.emit('updateCompleted', snapshot);
    } catch (err) {
      console.error(err);
    }
  }

  onUpdate(cb: () => void) {
    this.emitter.on('update', cb);
  }

  onUpdateCompleted(cb: (snapshot: GameStateSnapshot<SnapshotDiff>) => void) {
    this.emitter.on('updateCompleted', cb);
    return () => this.emitter.off('updateCompleted', cb);
  }

  private async sync() {
    const snapshots = await this.networkAdapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }

  async cancelPlayCard() {
    if (this.state.phase.state !== GAME_PHASES.PLAYING_CARD) return;

    this.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: this.state.turnPlayer }
    });
    const playedCard = this.state.entities[this.state.phase.ctx.card] as CardViewModel;

    void this.fxAdapter.onCancelPlayCard(playedCard, this);
  }

  commitSpaceSelection() {
    this.dispatch({
      type: 'commitSpaceSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  chooseCards(indices: number[]) {
    this.dispatch({
      type: 'chooseCards',
      payload: {
        playerId: this.playerId,
        indices
      }
    });
  }

  surrender() {
    this.dispatch({
      type: 'surrender',
      payload: {
        playerId: this.playerId
      }
    });
  }

  pass() {
    this.dispatch({
      type: 'pass',
      payload: {
        playerId: this.playerId
      }
    });
  }

  attack(unitId: string, position: Point | null) {
    this.dispatch({
      type: 'attack',
      payload: {
        playerId: this.playerId,
        unitId,
        position
      }
    });
  }

  useAbility(cardId: string, abilityId: string) {
    this.dispatch({
      type: 'useAbility',
      payload: {
        playerId: this.playerId,
        cardId,
        abilityId
      }
    });
  }

  answerQuestion(id: string) {
    this.dispatch({
      type: 'answerQuestion',
      payload: {
        playerId: this.playerId,
        id
      }
    });
  }
}
