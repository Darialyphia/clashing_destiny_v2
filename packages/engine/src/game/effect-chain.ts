import {
  assert,
  StateMachine,
  stateTransition,
  type EmptyObject,
  type MaybePromise,
  type Serializable,
  type Values
} from '@game/shared';
import type { Game } from './game';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import { GameError } from './game-error';
import {
  serializePreResponseTarget,
  type PreResponseTarget,
  type SerializedPreResponseTarget
} from '../card/card-blueprint';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import { GAME_EVENTS } from './game.events';

const EFFECT_CHAIN_STATES = {
  BUILDING: 'BUILDING',
  RESOLVING: 'RESOLVING',
  FINISHED: 'FINISHED'
} as const;
type EffectChainState = Values<typeof EFFECT_CHAIN_STATES>;

const EFFECT_CHAIN_STATE_TRANSITIONS = {
  ADD_EFFECT: 'ADD_EFFECT',
  PASS: 'PASS',
  RESOLVE: 'RESOLVE',
  END: 'END'
} as const;
type EffectChainTransition = Values<typeof EFFECT_CHAIN_STATE_TRANSITIONS>;

export const EFFECT_TYPE = {
  CARD: 'CARD',
  ABILITY: 'ABILITY',
  COUNTERATTACK: 'COUNTERATTACK'
} as const;
export type EffectType = Values<typeof EFFECT_TYPE>;

export type Effect = {
  type: EffectType;
  source: AnyCard;
  handler: (game: Game) => Promise<void>;
  targets: PreResponseTarget[];
};

export type SerializedEffectChain = {
  stack: Array<{
    type: EffectType;
    source: string;
    targets: SerializedPreResponseTarget[];
  }>;
  player: string;
};

export const EFFECT_CHAIN_EVENTS = {
  EFFECT_CHAIN_STARTED: 'chain-started',
  EFFECT_CHAIN_EFFECT_ADDED: 'effect-added',
  EFFECT_CHAIN_PLAYER_PASSED: 'player-passed',
  EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED: 'effect-before-resolved',
  EFFECT_CHAIN_AFTER_EFFECT_RESOLVED: 'effect-after-resolved',
  EFFECT_CHAIN_RESOLVED: 'chain-resolved'
} as const;

export type EffectChainEventMap = {
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_STARTED]: ChainEvent;
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_EFFECT_ADDED]: ChainEffectAddedEvent;
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_PLAYER_PASSED]: ChainPassedEvent;
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED]: ChainEffectResolvedEvent;
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_AFTER_EFFECT_RESOLVED]: ChainEffectResolvedEvent;
  [EFFECT_CHAIN_EVENTS.EFFECT_CHAIN_RESOLVED]: ChainEvent;
};

export class EffectChain
  extends StateMachine<EffectChainState, EffectChainTransition>
  implements Serializable<SerializedEffectChain>
{
  private effectStack: Effect[] = [];
  private consecutivePasses = 0;
  private _currentPlayer: Player;
  private resolveCallbacks: Array<() => MaybePromise<void>> = [];

  static async create(
    game: Game,
    startingPlayer: Player,
    onResolved: () => MaybePromise<void>
  ) {
    const instance = new EffectChain(game, startingPlayer, onResolved);
    await game.emit(GAME_EVENTS.EFFECT_CHAIN_STARTED, new ChainEvent({}));
    return instance;
  }
  private constructor(
    private game: Game,
    startingPlayer: Player,
    onResolved: () => MaybePromise<void>
  ) {
    super(EFFECT_CHAIN_STATES.BUILDING);
    this.resolveCallbacks.push(() => this.game.inputSystem.askForPlayerInput());
    this.resolveCallbacks.push(onResolved);
    this._currentPlayer = startingPlayer;

    this.addTransitions([
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT,
        EFFECT_CHAIN_STATES.BUILDING,
        this.onAddEffect.bind(this)
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.PASS,
        EFFECT_CHAIN_STATES.BUILDING,
        this.onPass.bind(this)
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.BUILDING,
        EFFECT_CHAIN_STATE_TRANSITIONS.RESOLVE,
        EFFECT_CHAIN_STATES.RESOLVING
      ),
      stateTransition(
        EFFECT_CHAIN_STATES.RESOLVING,
        EFFECT_CHAIN_STATE_TRANSITIONS.END,
        EFFECT_CHAIN_STATES.FINISHED,
        this.onEnd.bind(this)
      )
    ]);
  }

  get size() {
    return this.effectStack.length;
  }

  private onAddEffect() {
    this.consecutivePasses = 0;
    this.switchTurn();
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  private get passesNeededToResolve() {
    // return this.effectStack.length <= 1 ? 1 : 2;
    return 2;
  }

  isCurrentPlayer(player: Player): boolean {
    return player.equals(this._currentPlayer);
  }

  private onPass() {
    this.consecutivePasses++;
    if (this.consecutivePasses >= this.passesNeededToResolve) {
      this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.RESOLVE);
      void this.resolveEffects();
    } else {
      this.switchTurn();
    }
  }

  private onEnd() {
    void this.resolveCallbacks.reverse().forEach(callback => callback());
  }

  onResolved(cb: () => MaybePromise<void>) {
    this.resolveCallbacks.push(cb);
  }

  private async resolveEffects() {
    while (this.effectStack.length > 0) {
      const effect = this.effectStack.pop();
      if (effect) {
        await this.game.emit(
          GAME_EVENTS.EFFECT_CHAIN_BEFORE_EFFECT_RESOLVED,
          new ChainEffectResolvedEvent({
            index: this.effectStack.length,
            effect: effect!
          })
        );
        await effect.handler(this.game);
        await this.game.emit(
          GAME_EVENTS.EFFECT_CHAIN_AFTER_EFFECT_RESOLVED,
          new ChainEffectResolvedEvent({
            index: this.effectStack.length,
            effect: effect!
          })
        );
      }
    }
    await this.game.emit(GAME_EVENTS.EFFECT_CHAIN_RESOLVED, new ChainEvent({}));
    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.END);
  }

  private switchTurn(): void {
    this._currentPlayer = this._currentPlayer.opponent;
  }

  async addEffect(effect: Effect, player: Player) {
    assert(
      this.can(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT),
      new InactiveEffectChainError()
    );
    assert(player.equals(this._currentPlayer), new IllegalPlayerResponseError());

    this.effectStack.push(effect);
    await this.game.emit(
      GAME_EVENTS.EFFECT_CHAIN_EFFECT_ADDED,
      new ChainEffectAddedEvent({
        player,
        index: this.effectStack.length - 1,
        effect
      })
    );
    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT);
  }

  async pass(player: Player) {
    assert(this.can(EFFECT_CHAIN_STATE_TRANSITIONS.PASS), new InactiveEffectChainError());
    assert(player.equals(this._currentPlayer), new IllegalPlayerResponseError());
    await this.game.emit(
      GAME_EVENTS.EFFECT_CHAIN_PLAYER_PASSED,
      new ChainPassedEvent({ player })
    );
    this.dispatch(EFFECT_CHAIN_STATE_TRANSITIONS.PASS);
  }

  canAddEffect(player: Player): boolean {
    return (
      player.equals(this._currentPlayer) &&
      this.can(EFFECT_CHAIN_STATE_TRANSITIONS.ADD_EFFECT)
    );
  }

  serialize(): SerializedEffectChain {
    return {
      stack: this.effectStack.map(effect => ({
        type: effect.type,
        source: effect.source.id,
        targets: effect.targets.map(serializePreResponseTarget)
      })),
      player: this._currentPlayer.id
    };
  }
}

export class IllegalPlayerResponseError extends GameError {
  constructor() {
    super('Illegal player response');
  }
}

export class ChainAlreadyStartedError extends GameError {
  constructor() {
    super('Effect chain is already started');
  }
}

export class InactiveEffectChainError extends GameError {
  constructor() {
    super('No effect chain is currently active');
  }
}

export class ChainEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class ChainEffectAddedEvent extends TypedSerializableEvent<
  { player: Player; index: number; effect: Effect },
  {
    player: string;
    index: number;
    effect: SerializedEffectChain['stack'][number];
  }
> {
  serialize() {
    return {
      player: this.data.player.id,
      index: this.data.index,
      effect: {
        type: this.data.effect.type,
        source: this.data.effect.source.id,
        targets: this.data.effect.targets.map(serializePreResponseTarget)
      }
    };
  }
}

export class ChainPassedEvent extends TypedSerializableEvent<
  { player: Player },
  { player: string }
> {
  serialize() {
    return {
      player: this.data.player.id
    };
  }
}

export class ChainEffectResolvedEvent extends TypedSerializableEvent<
  { index: number; effect: Effect },
  {
    index: number;
    effect: SerializedEffectChain['stack'][number];
  }
> {
  serialize() {
    return {
      index: this.data.index,
      effect: {
        type: this.data.effect.type,
        source: this.data.effect.source.id,
        targets: this.data.effect.targets.map(serializePreResponseTarget)
      }
    };
  }
}
