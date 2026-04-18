import { type Override } from '@game/shared';
import { CardViewModel } from '../view-models/card.model';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { GameClient } from '../client';
import {
  GAME_EVENTS,
  type SerializedEvent,
  type SerializedStarEvent
} from '../../game/game.events';
import { AbilityViewModel } from '../view-models/ability.model';
import type {
  SerializedOmniscientState,
  SerializedPlayerState,
  SerializedEntity,
  EntityDictionary,
  SnapshotDiff
} from '../../game/systems/game-serializer';
import type { PatchBasedSnapshotDiff } from '../../game/systems/patch-types';
import { BoardCellViewModel } from '../view-models/board-cell.model';
import { UnitViewModel } from '../view-models/unit.model';
import { TileViewModel } from '../view-models/tile.model';
import { ArtifactViewModel } from '../view-models/artifact.model';

export type GameStateEntities = Record<
  string,
  | PlayerViewModel
  | CardViewModel
  | ModifierViewModel
  | AbilityViewModel
  | BoardCellViewModel
  | UnitViewModel
  | TileViewModel
  | ArtifactViewModel
>;

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
        { entityType: 'cell' },
        entity => new BoardCellViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'unit' },
        entity => new UnitViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'tile' },
        entity => new TileViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'ability' },
        entity => new AbilityViewModel(entity, dict, this.client)
      )
      .with(
        { entityType: 'artifact' },
        entity => new ArtifactViewModel(entity, dict, this.client)
      )
      .otherwise(() => {
        throw new Error(`Unknown entity type: ${(entity as any).entityType}`);
      });
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      dict[id] = this.buildViewModel(entity);
    }
    return dict;
  };

  // prepopulate the state with new entities because they could be used by the fx events
  preupdate(newState: SnapshotDiff) {
    if (!this.state) return;

    for (const id of newState.addedEntities) {
      const entity = newState.entities[id];

      this.state.entities[id] = this.buildViewModel(entity as SerializedEntity);
    }
  }

  update(newState: SnapshotDiff): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entities, config, addedEntities, removedEntities, ...rest } = newState;
    for (const [id, entity] of Object.entries(entities)) {
      if (this.state.entities[id]) {
        this.state.entities[id] = this.state.entities[id].update(entity as any).clone();
      } else {
        this.state.entities[id] = this.buildViewModel(entity as any);
      }
    }

    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    this.state = {
      ...this.state,
      ...rest,
      config: { ...this.state.config, ...config },
      board: { ...this.state.board, ...rest.board }
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
      config: { ...this.state.config, ...config },
      board: { ...this.state.board, ...rest.board }
    };
  }

  async onEvent(
    event: SerializedStarEvent,
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (event.eventName === GAME_EVENTS.CARD_BEFORE_PLAY) {
      return this.onBeforePlayCard(event, flush);
    }
    if (event.eventName === GAME_EVENTS.MINION_AFTER_SUMMON) {
      return this.onAfterMinionSummoned(event, flush);
    }
    return await flush();
    // if (event.eventName === GAME_EVENTS.ARTIFACT_EQUIPED) {
    //   return this.onArtifactEquiped(event, flush);
    // }
    // if (event.eventName === GAME_EVENTS.EFFECT_CHAIN_EFFECT_ADDED) {
    //   return this.onChainEffectAdded(event, flush);
    // }
  }

  private async onBeforePlayCard(
    event: {
      event: SerializedEvent<'CARD_BEFORE_PLAY'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (!this.state.entities[event.event.card.id]) {
      return;
    }
    const card = this.buildViewModel(event.event.card as any) as CardViewModel;
    this.state.entities[card.id] = card;
    return await flush();
  }

  private async onAfterMinionSummoned(
    event: {
      event: SerializedEvent<'MINION_AFTER_SUMMON'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (!this.state.entities[event.event.unit.id]) {
      return;
    }
    const unit = this.buildViewModel(event.event.unit as any) as UnitViewModel;
    this.state.entities[unit.id] = unit;
    if (!this.state.units.includes(unit.id)) {
      this.state.units.push(unit.id);
    }
    this.state.board.cells.forEach(cellId => {
      const cell = this.state.entities[cellId] as BoardCellViewModel;
      if (cell.x === unit.position.x && cell.y === unit.position.y) {
        cell.update({ unit: unit.id });
      }
    });
    this.state = { ...this.state };
    return await flush();
  }
}
