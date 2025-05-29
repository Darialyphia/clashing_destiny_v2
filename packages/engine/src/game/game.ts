import { defaultConfig, type Config } from '../config';
import { InputSystem, type SerializedInput } from '../input/input-system';
import type { Player, PlayerOptions } from '../player/player.entity';
import { RngSystem } from '../rng/rng.system';
import { TypedSerializableEventEmitter } from '../utils/typed-emitter';
import { type BetterOmit, type IndexedRecord, type Serializable } from '@game/shared';
import { GameSnaphotSystem } from './systems/game-snapshot.system';
import { PlayerSystem } from '../player/player.system';
import { GAME_EVENTS, GameReadyEvent, type GameEventMap } from './game.events';
import { GamePhaseSystem } from './systems/game-phase.system';
import { modifierIdFactory } from '../modifier/modifier.entity';
import { CardSystem } from '../card/card.system';
import type { CardBlueprint } from '../card/card-blueprint';
import { GameInteractionSystem } from './systems/game-interaction.system';
import { BoardSystem } from '../board/board.system';
import { EffectChainSystem } from './systems/effect-chain.system';

export type GameOptions = {
  id: string;
  rngSeed: string;
  mapId: string;
  history?: SerializedInput[];
  overrides: Partial<{
    cardPool: IndexedRecord<CardBlueprint, 'id'>;
    config: Partial<Config>;
    winCondition: (game: Game, player: Player) => boolean;
  }>;
  isSimulation?: boolean;
  players: [PlayerOptions, PlayerOptions];
};

export type SerializedGame = {
  initialState: BetterOmit<GameOptions, 'overrides'>;
  history: SerializedInput[];
};

export class Game implements Serializable<SerializedGame> {
  readonly id: string;

  private readonly emitter = new TypedSerializableEventEmitter<GameEventMap>();

  readonly config: Config;

  readonly rngSystem = new RngSystem(this);

  readonly inputSystem = new InputSystem(this);

  readonly snapshotSystem = new GameSnaphotSystem(this);

  readonly playerSystem = new PlayerSystem(this);

  readonly gamePhaseSystem = new GamePhaseSystem(this);

  readonly cardSystem = new CardSystem(this);

  readonly boardSystem = new BoardSystem(this);

  readonly effectChainSystem = new EffectChainSystem(this);

  // readonly unitSystem = new UnitSystem(this);

  // readonly interactableSystem = new InteractableSystem(this);

  readonly interaction = new GameInteractionSystem(this);

  readonly isSimulation: boolean;

  readonly modifierIdFactory = modifierIdFactory();

  readonly cardPool: IndexedRecord<CardBlueprint, 'id'>;

  constructor(readonly options: GameOptions) {
    this.id = options.id;
    this.config = Object.assign({}, defaultConfig, options.overrides.config);
    this.isSimulation = options.isSimulation ?? false;
    this.setupStarEvents();
    this.cardPool = options.overrides.cardPool ?? {};
  }

  // the event emitter doesnt provide the event name if you enable wildcards, so let's implement it ourselves
  private setupStarEvents() {
    // Object.values(GAME_EVENTS).forEach(eventName => {
    //   this.on(eventName as any, event => {
    //     this.emit('*', new GameStarEvent({ e: { event, eventName } }));
    //   });
    // });
  }

  async initialize() {
    this.rngSystem.initialize({ seed: this.options.rngSeed });
    this.cardSystem.initialize({ cardPool: this.cardPool });
    await this.playerSystem.initialize({
      players: this.options.players
    });
    this.boardSystem.initialize();
    await this.gamePhaseSystem.initialize();
    this.interaction.initialize();
    this.effectChainSystem.initialize();
    await this.inputSystem.initialize(this.options.history ?? []);
    this.snapshotSystem.takeSnapshot();
    await this.emit(GAME_EVENTS.READY, new GameReadyEvent({}));
  }

  serialize() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { overrides, ...options } = this.options;
    return {
      initialState: options,
      history: this.inputSystem.serialize()
    };
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

  async emit<TEventName extends keyof GameEventMap & string>(
    eventName: TEventName,
    eventArg: GameEventMap[TEventName]
  ) {
    await this.emitter.emit(eventName, eventArg);
  }

  dispatch(input: SerializedInput) {
    return this.inputSystem.dispatch(input);
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }

  // clone(id: number) {
  //   const game = new Game({
  //     ...this.options,
  //     id: `simulation_${id}`,
  //     history: this.inputSystem.serialize()
  //   });
  //   game.initialize();

  //   return game;
  // }

  // simulateDispatch(playerId: string, input: SerializedInput) {
  //   const game = this.clone(++this.nextSimulationId);
  //   game.dispatch(input);
  //   game.snapshotSystem.takeSnapshot();

  //   return game.snapshotSystem.getLatestSnapshotForPlayer(playerId);
  // }
}
