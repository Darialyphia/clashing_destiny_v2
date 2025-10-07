import { System } from '../../system';
import type { Config } from '../../config';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedGamePhaseContext } from './game-phase.system';
import type { SerializedInteractionContext } from './game-interaction.system';
import type { SerializedBoard } from '../../board/board-side.entity';
import type { CardBeforePlayEvent, CardDiscardEvent } from '../../card/card.events';
import type { SerializedEffectChain } from '../effect-chain';
import type { AnyObject } from '@game/shared';
import { areArraysIdentical } from '../../utils/utils';
import type { SerializedAbility } from '../../card/card-blueprint';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { GAME_PHASES } from '../game.enums';
import type { SerializedSigilCard } from '../../card/entities/sigil.entity';

export type GameStateSnapshot<T> =
  | {
      id: number;
      state: T;
      events: SerializedStarEvent[];
      kind: 'state';
    }
  | {
      id: number;
      events: SerializedStarEvent[];
      kind: 'error';
    };

export type EntityDictionary = Record<
  string,
  | SerializedMinionCard
  | SerializedHeroCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedSigilCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedAbility
>;

export type EntityDiffDictionary = Record<
  string,
  | Partial<SerializedMinionCard>
  | Partial<SerializedSpellCard>
  | Partial<SerializedArtifactCard>
  | Partial<SerializedHeroCard>
  | Partial<SerializedSigilCard>
  | Partial<SerializedPlayer>
  | Partial<SerializedModifier>
  | Partial<SerializedAbility>
>;

export type SerializedOmniscientState = {
  config: Config;
  entities: EntityDictionary;
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  players: string[];
  board: SerializedBoard;
  currentPlayer: string;
  turnCount: number;
  effectChain: SerializedEffectChain | null;
};

export type SnapshotDiff = {
  config: Partial<Config>;
  entities: EntityDiffDictionary;
  addedEntities: string[];
  removedEntities: string[];
  phase: SerializedGamePhaseContext;
  interaction: SerializedInteractionContext;
  board: SerializedBoard;
  turnCount: number;
  currentPlayer: string;
  players: string[];
  effectChain: SerializedEffectChain | null;
};

export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnapshotSystem extends System<{ enabled: boolean }> {
  private isEnabled = true;

  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  private getObjectDiff<T extends AnyObject>(obj: T, prevObj: T | undefined): Partial<T> {
    if (!prevObj) return { ...obj };
    const result: Partial<T> = {};
    for (const key in obj) {
      if (Array.isArray(obj[key]) && Array.isArray(prevObj[key])) {
        if (!areArraysIdentical(obj[key], prevObj[key])) {
          result[key] = obj[key];
        }
      } else if (obj[key] !== prevObj[key]) {
        result[key] = obj[key];
      }
    }
    for (const key in prevObj) {
      if (!(key in obj)) {
        result[key] = undefined;
      }
    }
    return result;
  }

  private diffSnapshots(
    state: SerializedOmniscientState,
    prevState: SerializedOmniscientState
  ): SnapshotDiff {
    const entities: EntityDiffDictionary = {};
    for (const [key, entity] of Object.entries(state.entities)) {
      const diff = this.getObjectDiff(entity, prevState.entities[key]);
      if (Object.keys(diff).length > 0) {
        entities[key] = diff;
      }
    }
    return {
      config: this.getObjectDiff(state.config, prevState.config),
      entities,
      removedEntities: Object.keys(prevState.entities).filter(
        key => !(key in state.entities)
      ),
      addedEntities: Object.keys(state.entities).filter(
        key => !(key in prevState.entities)
      ),
      phase: state.phase,
      interaction: state.interaction,
      board: state.board,
      turnCount: state.turnCount - prevState.turnCount,
      currentPlayer: state.currentPlayer,
      players: state.players,
      effectChain: state.effectChain
    };
  }

  initialize({ enabled }: { enabled: boolean }): void {
    this.isEnabled = enabled;

    const ignoredEvents: GameEventName[] = [
      GAME_EVENTS.NEW_SNAPSHOT,
      GAME_EVENTS.FLUSHED,
      GAME_EVENTS.INPUT_START,
      GAME_EVENTS.INPUT_END
    ];
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];

    this.game.on(
      '*',
      event => {
        if (ignoredEvents.includes(event.data.eventName)) return;
        if (!this.isEnabled) return;
        this.eventsSinceLastSnapshot.push(event);
      },
      100
    );
  }

  shutdown() {}

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  geSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SerializedPlayerState> {
    console.log(playerId, Object.keys(this.playerCaches));
    const snapshot = this.playerCaches[playerId][index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getLatestOmniscientDiffSnapshot(): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              ...latestSnapshot.state,
              removedEntities: [],
              addedEntities: Object.keys(latestSnapshot.state.entities)
            }
          : this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getOmniscientDiffSnapshotAt(index: number): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getOmniscientSnapshotAt(index);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              ...latestSnapshot.state,
              removedEntities: [],
              addedEntities: Object.keys(latestSnapshot.state.entities)
            }
          : this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.geSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  getLatestDiffSnapshotForPlayer(playerId: string): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.getLatestSnapshotForPlayer(playerId);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              ...latestSnapshot.state,
              removedEntities: [],
              addedEntities: Object.keys(latestSnapshot.state.entities)
            }
          : this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getDiffSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SnapshotDiff> {
    const latestSnapshot = this.geSnapshotForPlayerAt(playerId, index);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: {
          removedEntities: [],
          addedEntities: Object.keys(latestSnapshot.state.entities),
          ...latestSnapshot.state
        }
      };
    }
    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              ...latestSnapshot.state,
              removedEntities: [],
              addedEntities: Object.keys(latestSnapshot.state.entities)
            }
          : this.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};
    this.game.cardSystem.cards.forEach(card => {
      entities[card.id] = card.serialize();
      card.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
      if ('abilities' in card) {
        (card.abilities as Ability<AbilityOwner>[]).forEach(ability => {
          entities[ability.id] = ability.serialize();
        });
      }
    });
    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();
      player.modifiers.list.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });
    });
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      config: this.game.config,
      entities: this.buildEntityDictionary(),
      phase: this.game.gamePhaseSystem.serialize(),
      interaction: this.game.interaction.serialize(),
      board: this.game.boardSystem.serialize(),
      players: this.game.playerSystem.players.map(player => player.id),
      currentPlayer: this.game.interaction.interactivePlayer.id,
      turnCount: this.game.turnSystem.elapsedTurns,
      effectChain: this.game.effectChainSystem.serialize()
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    // Remove entities that the player shouldn't have access to in order to prevent cheating
    const opponent = this.game.playerSystem.getPlayerById(playerId)!.opponent;

    const hasBeenPlayed = (cardId: string) => {
      return this.eventsSinceLastSnapshot.some(e => {
        const event = e.data.event;
        if (
          e.data.eventName === GAME_EVENTS.CARD_BEFORE_PLAY &&
          (event as CardBeforePlayEvent).data.card.id === cardId
        ) {
          return true;
        }
        if (
          e.data.eventName === GAME_EVENTS.CARD_DISCARD &&
          (event as CardDiscardEvent).data.card.id === cardId
        ) {
          return true;
        }

        return false;
      });
    };
    opponent.cardManager.mainDeck.cards.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    opponent.cardManager.hand.forEach(card => {
      if (hasBeenPlayed(card.id)) return;

      delete state.entities[card.id];
    });

    return state;
  }

  async takeSnapshot() {
    try {
      if (!this.isEnabled) return;

      const events = this.eventsSinceLastSnapshot
        // @ts-expect-error
        .toSorted((a, b) => (a.data.event.__id - b.data.event.__id) as unknown as number)
        .map(event => event.serialize());
      const previousId = this.nextId - 1;
      const id = this.nextId++;
      const omnisicientState = this.serializeOmniscientState();

      if (events.length === 0 && previousId > 0) {
        const previousSnapshot = this.getOmniscientSnapshotAt(previousId);
        if (previousSnapshot.kind === 'state') {
          const prevJSON = JSON.stringify(previousSnapshot.state);
          const currentJSON = JSON.stringify(omnisicientState);
          if (prevJSON === currentJSON) {
            this.nextId--;
            this.eventsSinceLastSnapshot = [];
            return;
          }
        }
      }

      this.omniscientCache.push({
        kind: 'state',
        id,
        events: events as any,
        state: omnisicientState
      });
      this.playerCaches[this.game.playerSystem.player1.id].push({
        kind: 'state',
        id,
        events: events as any,
        state: this.serializePlayerState(this.game.playerSystem.player1.id)
      });

      this.playerCaches[this.game.playerSystem.player2.id].push({
        kind: 'state',
        id,
        events: events as any,
        state: this.serializePlayerState(this.game.playerSystem.player2.id)
      });
      console.log(`snapshot ${id} taken`);
      console.log('omniscient cache size', this.omniscientCache.length);
      console.log(
        'player 1 cache size',
        this.playerCaches[this.game.playerSystem.player1.id].length
      );
      console.log(
        'player 2 cache size',
        this.playerCaches[this.game.playerSystem.player2.id].length
      );
      this.eventsSinceLastSnapshot = [];
      await this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({ id }));
    } catch (err) {
      const idToRemove = this.nextId;
      Object.values(this.playerCaches).forEach(cache => {
        if (cache.at(-1)?.id === idToRemove) cache.pop();
      });
      if (this.omniscientCache.at(-1)?.id === idToRemove) this.omniscientCache.pop();

      this.eventsSinceLastSnapshot = [];
      this.nextId--;
      throw err;
    }
  }

  async takeErrorSnapshot() {
    if (!this.isEnabled) return;
    const id = this.nextId++;
    const events = this.eventsSinceLastSnapshot
      .filter(e => e.data.eventName === GAME_EVENTS.ERROR)
      .map(event => event.serialize()) as SerializedStarEvent[];

    const snapshot = {
      id,
      kind: 'error' as const,
      events,
      state: {
        config: this.game.config,
        entities: {},
        players: this.game.playerSystem.players.map(player => player.id),
        phase: {
          state: GAME_PHASES.GAME_END,
          ctx: {}
        },
        interaction: {
          ctx: {
            player: this.game.playerSystem.player1.id
          }
        }
      } as unknown as SerializedPlayerState
    };

    this.playerCaches[this.game.playerSystem.player1.id].push(snapshot);
    this.playerCaches[this.game.playerSystem.player2.id].push(snapshot);
    this.omniscientCache.push(snapshot);

    this.eventsSinceLastSnapshot = [];
    await this.game.emit(GAME_EVENTS.NEW_SNAPSHOT, new GameNewSnapshotEvent({ id }));
  }
}
