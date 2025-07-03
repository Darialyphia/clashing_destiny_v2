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
import { INTERACTION_STATES } from '../game/systems/game-interaction.system';
import type { Affinity } from '../card/card.enums';

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

export type FxAdapter = {
  onDeclarePlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onCancelPlayCard: (card: CardViewModel, client: GameClient) => MaybePromise<void>;
  onSelectCardForManaCost: (
    card: CardViewModel,
    client: GameClient
  ) => MaybePromise<void>;
  onUnselectCardForManaCost: (
    card: CardViewModel,
    client: GameClient
  ) => MaybePromise<void>;
};

export type GameClientOptions = {
  networkAdapter: NetworkAdapter;
  fxAdapter: FxAdapter;
  gameType: GameType;
  playerId: string;
};

export class GameClient {
  readonly fx = new FxController();

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly fxAdapter: FxAdapter;

  private gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<
    number,
    GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  >();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<
    GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  > = [];

  private emitter = new TypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>;
  }>('sequential');

  constructor(options: GameClientOptions) {
    this.networkAdapter = options.networkAdapter;
    this.fxAdapter = options.fxAdapter;
    this.stateManager = new ClientStateController(this);
    this.ui = new UiController(this);
    this.gameType = options.gameType;
    this.playerId = options.playerId;

    this.networkAdapter.subscribe(async snapshot => {
      console.groupCollapsed(`Snapshot Update: ${snapshot.id}`);
      console.log('state', snapshot.state);
      console.log('events', snapshot.events);
      console.groupEnd();
      this.queue.push(snapshot);
      if (this._processingUpdate) return;
      await this.processQueue();
    });

    this.cancelPlayCard = this.cancelPlayCard.bind(this);
    this.commitPlayCard = this.commitPlayCard.bind(this);
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

    return snapshot.interaction.ctx.player;
  }

  getActivePlayerId() {
    if (this.stateManager.state.effectChain) {
      return this.stateManager.state.effectChain.player;
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
      this.stateManager.preupdate(snapshot.state);
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

  onUpdateCompleted(
    cb: (
      snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
    ) => void
  ) {
    this.emitter.on('updateCompleted', cb);
  }

  private async sync() {
    const snapshots = await this.networkAdapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }

  cancelPlayCard() {
    if (this.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD) return;

    this.networkAdapter.dispatch({
      type: 'cancelPlayCard',
      payload: { playerId: this.state.turnPlayer }
    });
    const playedCard = this.state.entities[
      this.state.interaction.ctx.card
    ] as CardViewModel;

    void this.fxAdapter.onCancelPlayCard(playedCard, this);
  }

  commitPlayCard() {
    this.networkAdapter.dispatch({
      type: 'commitPlayCard',
      payload: {
        playerId: this.playerId,
        manaCostIndices: this.ui.selectedManaCostIndices
      }
    });
  }

  commitMinionSlotSelection() {
    this.networkAdapter.dispatch({
      type: 'commitMinionSlotSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  commitCardSelection() {
    this.networkAdapter.dispatch({
      type: 'commitCardSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  skipBlock() {
    this.networkAdapter.dispatch({
      type: 'declareBlocker',
      payload: {
        blockerId: null,
        playerId: this.playerId
      }
    });
  }

  endTurn() {
    this.networkAdapter.dispatch({
      type: 'declareEndTurn',
      payload: {
        playerId: this.playerId
      }
    });
  }

  passChain() {
    this.networkAdapter.dispatch({
      type: 'passChain',
      payload: {
        playerId: this.playerId
      }
    });
  }

  chooseAffinity(affinity: Affinity) {
    this.networkAdapter.dispatch({
      type: 'chooseAffinity',
      payload: {
        playerId: this.playerId,
        affinity
      }
    });
  }

  chooseCards(indices: number[]) {
    this.networkAdapter.dispatch({
      type: 'chooseCards',
      payload: {
        playerId: this.playerId,
        indices
      }
    });
  }

  unlockTalent(id: string | null) {
    this.networkAdapter.dispatch({
      type: 'unlockTalent',
      payload: {
        playerId: this.playerId,
        id
      }
    });
  }
}
