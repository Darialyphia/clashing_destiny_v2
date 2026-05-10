import { waitFor, type Override } from '@game/shared';
import type {
  SerializedOmniscientState,
  SerializedPlayerState,
  SnapshotDiff,
  PatchBasedSnapshotDiff
} from '../../game/systems/game-snapshot.system';
import type {
  EntityDictionary,
  SerializedEntity
} from '../../game/systems/game-serializer';
import { CardViewModel } from '../view-models/card.model';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { GameClient, GameStateEntities } from '../client';
import {
  GAME_EVENTS,
  type SerializedEvent,
  type SerializedStarEvent
} from '../../game/game.events';
import { AbilityViewModel } from '../view-models/ability.model';
import { BoardSpaceViewModel } from '../view-models/board-space.model';

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export class ClientStateController {
  state!: GameClientState;

  constructor(private client: GameClient) {}

  initialize(initialState: SerializedPlayerState | SerializedOmniscientState) {
    this.state = {
      ...initialState,
      entities: {}
    };
    this.state.entities = this.buildentities(initialState.entities);
  }

  private buildViewModel(entity: SerializedEntity) {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};

    return match(entity)
      .with(
        { entityType: 'player' },
        entity => new PlayerViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'card' },
        entity => new CardViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'modifier' },
        entity => new ModifierViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'ability' },
        entity => new AbilityViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'board-space' },
        entity => new BoardSpaceViewModel(entity, dict, this.client)
      )
      .exhaustive();
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      dict[id] = this.buildViewModel(entity);
    }
    return dict;
  };

  // prepopulate the state with new entities because they could be used by the fx events
  preupdate(newState: PatchBasedSnapshotDiff) {
    if (!this.state) return;

    Object.entries(newState.addedEntities).forEach(([id, entity]) => {
      this.state.entities[id] = this.buildViewModel(entity as SerializedEntity);
    });
  }

  update(newState: PatchBasedSnapshotDiff): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entityPatches, config, addedEntities, removedEntities, ...rest } = newState;
    for (const [id, patches] of Object.entries(entityPatches)) {
      if (this.state.entities[id]) {
        this.state.entities[id].updateWithPatches(patches);
      }
    }

    // clone all entities to trigger reactivity in case of reference equality
    // ex: a unit's modifier is updated, but the unit isnt
    // a computed property depending on the unit wouldnt update
    for (const [id, entity] of Object.entries(this.state.entities)) {
      this.state.entities[id] = entity.clone();
    }

    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    this.state = {
      ...this.state,
      ...rest,
      config: { ...this.state.config, ...config }
    };
  }

  /**
   * Update with patch-based diff for more granular updates
   */
  updateWithPatches(newState: PatchBasedSnapshotDiff): void {
    const { entityPatches, addedEntities, removedEntities, config, ...rest } = newState;

    // Apply patches to existing entities
    for (const [id, patches] of Object.entries(entityPatches)) {
      if (this.state.entities[id]) {
        // Entity exists - apply patches
        this.state.entities[id] = this.state.entities[id]
          .updateWithPatches(patches)
          .clone();
      } else {
        console.warn(`Entity ${id} not found for patching`);
      }
    }

    // Add new entities
    for (const [id, entity] of Object.entries(addedEntities)) {
      this.state.entities[id] = this.buildViewModel(entity as any);
    }

    // Remove deleted entities
    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    // Update top-level state
    this.state = {
      ...this.state,
      ...rest,
      config: { ...this.state.config, ...config }
    };
  }

  async onEvent(event: SerializedStarEvent) {
    if (event.eventName === GAME_EVENTS.MINION_SUMMONED) {
      return this.onMinionSummoned(event);
    }

    if (event.eventName === GAME_EVENTS.ARTIFACT_EQUIPED) {
      return this.onArtifactEquiped(event);
    }

    if (event.eventName === GAME_EVENTS.AFTER_CHANGE_PHASE) {
      return this.onAfterChangePhase(event);
    }
  }

  private async onMinionSummoned(event: { event: SerializedEvent<'MINION_SUMMONED'> }) {
    const card = this.buildViewModel(event.event.card) as CardViewModel;
    this.state.entities[card.id] = card;

    const boardSpace = Object.values(this.state.entities).find(
      e => e.id === event.event.position.id
    )! as BoardSpaceViewModel;

    this.state.entities[boardSpace.id] = boardSpace
      .update({
        card: card.id
      })
      .clone();
  }

  private async onArtifactEquiped(event: { event: SerializedEvent<'ARTIFACT_EQUIPED'> }) {
    const card = this.buildViewModel(event.event.card) as CardViewModel;
    this.state.entities[card.id] = card;

    const boardSpace = Object.values(this.state.entities).find(
      e => e.id === event.event.position.id
    )! as BoardSpaceViewModel;

    this.state.entities[boardSpace.id] = boardSpace
      .update({
        card: card.id
      })
      .clone();
  }

  private async onAfterChangePhase(event: {
    event: SerializedEvent<'AFTER_CHANGE_PHASE'>;
  }) {
    this.state.phase = event.event.to;
    this.state = { ...this.state };
  }
}
