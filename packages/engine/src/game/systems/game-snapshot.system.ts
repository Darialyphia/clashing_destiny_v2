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

  private isErrorSnapshot(snapshot: GameStateSnapshot<any>) {
    return snapshot.kind === 'error';
  }

  // Return a clean snapshot state, used for the initial state snapshot or after an error snapshot
  private getDefaultDiffSnapshotState(
    state: SerializedOmniscientState | SerializedPlayerState
  ) {
    return {
      entityPatches: {},
      addedEntities: state.entities,
      removedEntities: [],
      phase: state.phase,
      interaction: state.interaction,
      board: state.board,
      turnCount: state.turnCount,
      players: state.players,
      config: state.config,
      tiles: state.tiles,
      units: state.units,
      turnPlayer: state.turnPlayer
    };
  }

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getSnapshotForPlayerAt(
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

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.getSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  getLatestOmniscientDiffSnapshot(): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestOmniscientSnapshot();
    if (this.isErrorSnapshot(latestSnapshot)) {
      return latestSnapshot;
    }

    if (this.nextId < 2) {
      // First snapshot - all entities are "added"
      return {
        ...latestSnapshot,
        state: this.getDefaultDiffSnapshotState(latestSnapshot.state)
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(this.nextId - 2);

    return {
      ...latestSnapshot,
      state: this.isErrorSnapshot(previousSnapshot)
        ? this.getDefaultDiffSnapshotState(latestSnapshot.state)
        : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getOmniscientDiffSnapshotAt(index: number): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getOmniscientSnapshotAt(index);
    if (this.isErrorSnapshot(latestSnapshot)) return latestSnapshot;

    if (index < 1) {
      return {
        ...latestSnapshot,
        state: this.getDefaultDiffSnapshotState(latestSnapshot.state)
      };
    }

    const previousSnapshot = this.getOmniscientSnapshotAt(index - 1);

    return {
      ...latestSnapshot,
      state: this.isErrorSnapshot(previousSnapshot)
        ? this.getDefaultDiffSnapshotState(latestSnapshot.state)
        : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getLatestDiffSnapshotForPlayer(
    playerId: string
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const latestSnapshot = this.getLatestSnapshotForPlayer(playerId);
    if (this.isErrorSnapshot(latestSnapshot)) return latestSnapshot;

    if (this.nextId < 2) {
      return {
        ...latestSnapshot,
        state: this.getDefaultDiffSnapshotState(latestSnapshot.state)
      };
    }

    const previousSnapshot = this.getSnapshotForPlayerAt(playerId, this.nextId - 2);

    return {
      ...latestSnapshot,
      state: this.isErrorSnapshot(previousSnapshot)
        ? this.getDefaultDiffSnapshotState(latestSnapshot.state)
        : this.serializer.diffSnapshots(latestSnapshot.state, previousSnapshot.state)
    };
  }

  getDiffSnapshotForPlayerAt(
    index: number,
    playerId: string
  ): GameStateSnapshot<PatchBasedSnapshotDiff> {
    const snapshot = this.getSnapshotForPlayerAt(playerId, index);
    if (this.isErrorSnapshot(snapshot)) {
      return snapshot;
    }

    if (index < 1) {
      return {
        ...snapshot,
        state: this.getDefaultDiffSnapshotState(snapshot.state)
      };
    }

    const previousSnapshot = this.getSnapshotForPlayerAt(playerId, index - 1);

    return {
      ...snapshot,
      state: this.isErrorSnapshot(previousSnapshot)
        ? this.getDefaultDiffSnapshotState(snapshot.state)
        : this.serializer.diffSnapshots(snapshot.state, previousSnapshot.state)
    };
  }

  async takeSnapshot() {
    try {
      if (!this.isEnabled) return;

      const events = this.eventsSinceLastSnapshot
        // @ts-expect-error
        .toSorted((a, b) => (a.data.event.__id - b.data.event.__id) as unknown as number)
        .map((event: GameStarEvent) => event.serialize()) as SerializedStarEvent[];

      const id = this.nextId++;
      const omnisicientState = this.serializer.serializeOmniscientState();

      this.omniscientCache.push({
        kind: 'state',
        id,
        events: events,
        state: omnisicientState
      });

      this.playerCaches[this.game.playerSystem.player1.id].push({
        kind: 'state',
        id,
        events: events,
        state: this.serializer.serializePlayerState(
          this.game.playerSystem.player1.id,
          this.eventsSinceLastSnapshot
        )
      });
      this.playerCaches[this.game.playerSystem.player2.id].push({
        kind: 'state',
        id,
        events: events,
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
