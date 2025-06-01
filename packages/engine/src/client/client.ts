import type { BetterExtract, Override, Values } from '@game/shared';
import type { InputDispatcher } from '../input/input-system';
import type {
  EntityDictionary,
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../game/systems/game-snapshot.system';
import { ModifierViewModel } from './view-models/modifier.model';
import { CardViewModel } from './view-models/card.model';
import { PlayerViewModel } from './view-models/player.model';
import { match } from 'ts-pattern';
import { TypedEventEmitter } from '../utils/typed-emitter';
import { GAME_EVENTS, type GameEventMap } from '../game/game.events';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  PlayerViewModel | CardViewModel | ModifierViewModel
>;

export type GameClientOptions = {
  dispatcher: InputDispatcher;
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

export type GameClientState = Override<
  SerializedOmniscientState,
  {
    entities: GameStateEntities;
  }
>;

export type PreBattleEvent<T extends keyof GameEventMap> = `pre_${T}`;
export type PreBattleEventKey<T extends keyof typeof GAME_EVENTS> = `PRE_${T}`;
export const BATTLE_EVENTS = {
  ...GAME_EVENTS,
  ...(Object.fromEntries(
    Object.entries(GAME_EVENTS).map(([key, value]) => [`PRE_${key}`, `pre_${value}`])
  ) as unknown as {
    [Key in keyof typeof GAME_EVENTS as PreBattleEventKey<Key>]: PreBattleEvent<
      (typeof GAME_EVENTS)[Key]
    >;
  })
} as const;

export type ClientBattleEvent = Values<typeof BATTLE_EVENTS>;

export type BattleEventName = keyof GameEventMap | PreBattleEvent<keyof GameEventMap>;

type SerializedGameEventMap = {
  [Key in BattleEventName]: Key extends PreBattleEvent<infer U>
    ? ReturnType<GameEventMap[U]['serialize']>
    : Key extends keyof GameEventMap
      ? ReturnType<GameEventMap[Key]['serialize']>
      : never;
};

export class GameClient {
  private emitter = new TypedEventEmitter<SerializedGameEventMap>('parallel');

  private dispatch: InputDispatcher;

  private gameType: GameType;

  private initialState: SerializedOmniscientState | SerializedPlayerState;

  private playerId?: string;

  private state: GameClientState;

  private lastSnapshotId = -1;

  private _isPlayingFx = false;

  private _isReady = false;

  constructor(options: GameClientOptions) {
    this.dispatch = options.dispatcher;
    this.gameType = options.gameType;
    this.initialState = options.initialState;
    this.playerId = options.playerId;
    this.state = {
      ...this.initialState,
      entities: this.buildentities(this.initialState.entities, {})
    };
  }

  get isPlayingFx() {
    return this._isPlayingFx;
  }

  get isReady() {
    return this._isReady;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  async update(
    snapshot: GameStateSnapshot<SerializedOmniscientState | SerializedPlayerState>
  ) {
    if (snapshot.id <= this.lastSnapshotId) {
      console.log(
        `Stale snapshot, latest is ${this.lastSnapshotId}, received is ${snapshot.id}`
      );
      return;
    }
    this.lastSnapshotId = snapshot.id;

    try {
      this._isPlayingFx = true;

      for (const event of snapshot.events) {
        await this.emitter.emit(`pre_${event.eventName}`, event.event as any);
        await this.emitter.emit(event.eventName, event.event as any);
      }
      this._isPlayingFx = false;

      this.state.entities = this.buildentities(snapshot.state.entities, {
        ...this.state.entities
      });

      this.state.board = snapshot.state.board;
      this.state.config = snapshot.state.config;
      this.state.interaction = snapshot.state.interaction;
      this.state.phase = snapshot.state.phase;
      this.state.turnPlayer = snapshot.state.turnPlayer;
      this.state.turnCount = snapshot.state.turnCount;

      if (this.gameType === GAME_TYPES.LOCAL) {
        this.playerId = this.state.turnPlayer;
      }

      this._isReady = true;
    } catch (err) {
      console.error(err);
    }
  }

  private buildentities = (
    entities: EntityDictionary,
    existing: GameStateEntities
  ): GameClientState['entities'] => {
    for (const [id, entity] of Object.entries(entities)) {
      existing[id] = match(entity)
        .with(
          { entityType: 'player' },
          entity => new PlayerViewModel(entity, existing, this.dispatch)
        )
        .with(
          { entityType: 'card' },
          entity => new CardViewModel(entity, existing, this.dispatch)
        )
        .with(
          { entityType: 'modifier' },
          entity => new ModifierViewModel(entity, existing, this.dispatch)
        )
        .exhaustive();
    }
    return existing;
  };
}
