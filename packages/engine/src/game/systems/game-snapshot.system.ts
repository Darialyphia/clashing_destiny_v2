import { System } from '../../system';
import {
  GAME_EVENTS,
  GameNewSnapshotEvent,
  type GameEventName,
  type GameStarEvent,
  type SerializedStarEvent
} from '../game.events';
import { GAME_PHASES } from '../game.enums';
import {
  GameSerializer,
  type SerializedOmniscientState,
  type SerializedPlayerState,
  type SnapshotDiff
} from './game-serializer';
import type { PatchBasedSnapshotDiff } from './patch-types';

// Re-export types for convenience
export type { SerializedOmniscientState, SerializedPlayerState, SnapshotDiff };
export type { PatchBasedSnapshotDiff };

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

export class GameSnapshotSystem extends System<{ enabled: boolean }> {
  private isEnabled = true;
  private serializer!: GameSerializer;

  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  initialize({ enabled }: { enabled: boolean }): void {
    this.isEnabled = enabled;
    this.serializer = new GameSerializer(this.game);
    this.serializer.initialize();

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
          : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
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
          : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
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
          : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
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
          : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  /**
   * Get the latest omniscient snapshot as a patch-based diff
   * This uses deep diffing for more granular updates
   */
  getLatestOmniscientPatchDiffSnapshot(): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      // First snapshot - all entities are "added"
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          currentPlayer: latestSnapshot.state.currentPlayer,
          players: latestSnapshot.state.players,
          effectChain: latestSnapshot.state.effectChain,
          config: latestSnapshot.state.config
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              currentPlayer: latestSnapshot.state.currentPlayer,
              players: latestSnapshot.state.players,
              effectChain: latestSnapshot.state.effectChain,
              config: latestSnapshot.state.config
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  /**
   * Get a specific omniscient snapshot as a patch-based diff
   */
  getOmniscientPatchDiffSnapshotAt(
    index: number
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getOmniscientSnapshotAt(index);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          currentPlayer: latestSnapshot.state.currentPlayer,
          players: latestSnapshot.state.players,
          effectChain: latestSnapshot.state.effectChain,
          config: latestSnapshot.state.config
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              currentPlayer: latestSnapshot.state.currentPlayer,
              players: latestSnapshot.state.players,
              effectChain: latestSnapshot.state.effectChain,
              config: latestSnapshot.state.config
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  /**
   * Get the latest player snapshot as a patch-based diff
   */
  getLatestPatchDiffSnapshotForPlayer(
    playerId: string
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestSnapshotForPlayer(playerId);
    if (latestSnapshot.kind === 'error') {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: {
          entityPatches: {},
          addedEntities: latestSnapshot.state.entities,
          removedEntities: [],
          phase: latestSnapshot.state.phase,
          interaction: latestSnapshot.state.interaction,
          board: latestSnapshot.state.board,
          turnCount: latestSnapshot.state.turnCount,
          currentPlayer: latestSnapshot.state.currentPlayer,
          players: latestSnapshot.state.players,
          effectChain: latestSnapshot.state.effectChain,
          config: latestSnapshot.state.config
        }
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state:
        previousSnapshot.kind === 'error'
          ? {
              entityPatches: {},
              addedEntities: latestSnapshot.state.entities,
              removedEntities: [],
              phase: latestSnapshot.state.phase,
              interaction: latestSnapshot.state.interaction,
              board: latestSnapshot.state.board,
              turnCount: latestSnapshot.state.turnCount,
              currentPlayer: latestSnapshot.state.currentPlayer,
              players: latestSnapshot.state.players,
              effectChain: latestSnapshot.state.effectChain,
              config: latestSnapshot.state.config
            }
          : this.serializer.diffSnapshotsWithPatches(
              latestSnapshot.state,
              previousSnapshot.state
            )
    };
  }

  async takeSnapshot() {
    try {
      if (!this.isEnabled) return;

      const events = this.eventsSinceLastSnapshot
        // @ts-expect-error
        .toSorted((a, b) => (a.data.event.__id - b.data.event.__id) as unknown as number)
        .map((event: GameStarEvent) => event.serialize());
      const previousId = this.nextId - 1;
      const id = this.nextId++;
      const omnisicientState = this.serializer.serializeOmniscientState();

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
        state: this.serializer.serializePlayerState(
          this.game.playerSystem.player1.id,
          this.eventsSinceLastSnapshot
        )
      });

      this.playerCaches[this.game.playerSystem.player2.id].push({
        kind: 'state',
        id,
        events: events as any,
        state: this.serializer.serializePlayerState(
          this.game.playerSystem.player2.id,
          this.eventsSinceLastSnapshot
        )
      });

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
