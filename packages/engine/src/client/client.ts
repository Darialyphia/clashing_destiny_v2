import { type EmptyObject, type MaybePromise, type Values } from '@game/shared';
import type { InputDispatcher, SerializedInput } from '../input/input-system';
import type {
  GameStateSnapshot,
  PatchBasedSnapshotDiff,
  SnapshotDiff
} from '../game/systems/game-snapshot.system';
import type {
  SerializedOmniscientState,
  SerializedPlayerState
} from '../game/systems/game-serializer';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { FxController } from './controllers/fx-controller';
import {
  ClientStateController,
  type GameClientState
} from './controllers/state-controller';
import { UiController } from './controllers/ui-controller';
import { TypedEventEmitter } from '../utils/typed-emitter';
import type { AbilityViewModel } from './view-models/ability.model';
import type { BoardSpaceViewModel } from './view-models/board-space.model';
import { GAME_PHASES } from '../game/game.enums';
import { EFFECT_CHAIN_STATES } from '../game/effect-chain';
import type { Rune } from '../player/player.enums';

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
  | AbilityViewModel
  | BoardSpaceViewModel
>;

export type OnSnapshotUpdateCallback = (
  snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>
) => MaybePromise<void>;

export type NetworkAdapter = {
  dispatch: InputDispatcher;
  subscribe(cb: OnSnapshotUpdateCallback): void;
  sync: (
    lastSnapshotId: number
  ) => Promise<Array<GameStateSnapshot<PatchBasedSnapshotDiff>>>;
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

  readonly stateManager: ClientStateController;

  readonly ui: UiController;

  readonly networkAdapter: NetworkAdapter;

  readonly fxAdapter: FxAdapter;

  readonly gameType: GameType;

  private initialState!: SerializedOmniscientState | SerializedPlayerState;

  playerId: string;

  private lastSnapshotId = -1;

  private snapshots = new Map<number, GameStateSnapshot<PatchBasedSnapshotDiff>>();

  private _isPlayingFx = false;

  public isReady = false;

  private _processingUpdate = false;

  private queue: Array<GameStateSnapshot<PatchBasedSnapshotDiff>> = [];

  history: SerializedInput[] = [];

  private emitter = new TypedEventEmitter<{
    update: EmptyObject;
    updateCompleted: GameStateSnapshot<PatchBasedSnapshotDiff>;
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

    this.cancelInteraction = this.cancelInteraction.bind(this);
  }

  get nextSnapshotId() {
    return this.lastSnapshotId + 1;
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get state() {
    return this.stateManager.state;
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

  getActivePlayerId() {
    if (
      this.stateManager.state.effectChain &&
      this.stateManager.state.effectChain.state === EFFECT_CHAIN_STATES.BUILDING
    ) {
      return this.stateManager.state.effectChain.player;
    }
    return this.stateManager.state.interaction.ctx.player;
  }

  isActive() {
    return this.getActivePlayerId() === this.playerId;
  }

  async initialize(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>,
    history: SerializedInput[] = []
  ) {
    console.groupCollapsed('Initializing Game Client');
    console.log('Initial Snapshot:', snapshot);
    console.groupEnd();
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

  async update(snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>) {
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
        await this.stateManager.onEvent(event);
        await this.ui.onEvent(event);
        await this.fx.emit(event.eventName, event.event);
        await this.emitter.emit('update', {});
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
    return () => this.emitter.off('update', cb);
  }

  onUpdateCompleted(cb: (snapshot: GameStateSnapshot<PatchBasedSnapshotDiff>) => void) {
    this.emitter.on('updateCompleted', cb);
    return () => this.emitter.off('updateCompleted', cb);
  }

  waitUntil(predicate: (state: GameClientState) => boolean) {
    return new Promise<void>(resolve => {
      const check = () => {
        if (predicate(this.state)) {
          resolve();
          this.emitter.off('updateCompleted', check);
        }
      };
      check();
      this.emitter.on('updateCompleted', check);
    });
  }

  private async sync() {
    const snapshots = await this.networkAdapter.sync(this.lastSnapshotId);
    this.queue.push(...snapshots);
  }

  dispatch(input: SerializedInput) {
    if (this.isSpectator) return;

    this.history.push(input);
    return this.networkAdapter.dispatch(input);
  }

  declarePlayCard(card: CardViewModel) {
    this.ui.optimisticState.playedCardId = card.id;

    this.dispatch({
      type: 'declarePlayCard',
      payload: {
        id: card.id,
        playerId: this.playerId
      }
    });
  }

  cancelInteraction() {
    this.dispatch({
      type: 'cancelInteraction',
      payload: { playerId: this.state.currentPlayer }
    });
  }

  commitCardSelection() {
    this.dispatch({
      type: 'commitCardSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  commitRearrangeCards(buckets: Array<{ id: string; cards: string[] }>) {
    this.dispatch({
      type: 'commitRearrangeCards',
      payload: {
        playerId: this.playerId,
        buckets
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

  chooseCards(indices: number[]) {
    this.dispatch({
      type: 'chooseCards',
      payload: {
        playerId: this.playerId,
        indices
      }
    });
  }

  chooseChainEffect(effectId: string) {
    this.dispatch({
      type: 'chooseChainEffects',
      payload: {
        playerId: this.playerId,
        id: effectId
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

  surrender() {
    this.dispatch({
      type: 'surrender',
      payload: {
        playerId: this.playerId
      }
    });
  }

  commitSpaceSelection() {
    this.dispatch({
      type: 'commitSpaceSelection',
      payload: {
        playerId: this.playerId
      }
    });
  }

  takeResourceAction(action: { type: 'rune'; rune: Rune } | { type: 'draw' }) {
    this.dispatch({
      type: 'takeResourceAction',
      payload: {
        playerId: this.playerId,
        action
      }
    });
  }
}
