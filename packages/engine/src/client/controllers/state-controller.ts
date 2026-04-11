import type { Override } from '@game/shared';
import type {
  PatchBasedSnapshotDiff,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../../game/systems/game-snapshot.system';
import { CardViewModel } from '../view-models/card.model';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { GameClient, GameStateEntities } from '../client';
import type { SerializedArtifactCard } from '../../card/entities/artifact-card.entity';
import type { SerializedSpellCard } from '../../card/entities/spell-card.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { SerializedMinionCard } from '../../card/entities/minion-card.entity';
import type { SerializedCell } from '../../board/entities/board-cell.entity';
import { BoardCellViewModel } from '../view-models/board-cell.model';
import type { SerializedUnit } from '../../unit/unit.entity';
import { UnitViewModel } from '../view-models/unit.model';
import type { SerializedTile } from '../../tile/tile.entity';
import { TileViewModel } from '../view-models/tile.model';
import {
  GAME_EVENTS,
  type SerializedEvent,
  type SerializedStarEvent
} from '../../game/game.events';
import type { EntityDictionary } from '../../game/systems/game-serializer';
import type { SerializedAbility } from '../../card/entities/ability.entity';
import { AbilityViewModel } from '../view-models/ability.model';

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export type SerializedEntity =
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard
  | SerializedPlayer
  | SerializedModifier
  | SerializedCell
  | SerializedUnit
  | SerializedTile
  | SerializedAbility;
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
      .otherwise(() => {
        throw new Error(`Unknown entity type: ${(entity as any).entityType}`);
      });
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      if (!entity.entityType) continue; // receivd a partial update, skip it
      dict[id] = this.buildViewModel(entity);
    }
    return dict;
  };

  // prepopulate the state with new entities because they could be used by the fx events
  preupdate(newState: PatchBasedSnapshotDiff) {
    if (!this.state) return;

    for (const entity of Object.values(newState.addedEntities)) {
      if (!entity.entityType) continue; // receivd a partial update, skip it
      this.state.entities[entity.id] = this.buildViewModel(entity as SerializedEntity);
    }
  }

  update(newState: PatchBasedSnapshotDiff): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { entityPatches, config, board, addedEntities, removedEntities, ...rest } =
      newState;

    removedEntities.forEach(id => {
      delete this.state.entities[id];
    });

    // Apply entity patches to view models
    for (const [entityId, patches] of Object.entries(entityPatches)) {
      const viewModel = this.state.entities[entityId];
      if (!viewModel) continue;

      for (const patch of patches) {
        viewModel.applyPatch(patch);
      }

      this.state.entities[entityId] = viewModel.clone();
    }

    this.state = {
      ...this.state,
      ...rest,
      board: { ...this.state.board, ...board },
      config: { ...this.state.config, ...config }
    };
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
    this.state = { ...this.state };
    return await flush();
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
}
