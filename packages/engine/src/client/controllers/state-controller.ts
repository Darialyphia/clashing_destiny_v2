import { type Override } from '@game/shared';
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
import type { GameClient } from '../client';
import {
  GAME_EVENTS,
  type SerializedEvent,
  type SerializedStarEvent
} from '../../game/game.events';
import { AbilityViewModel } from '../view-models/ability.model';
import { CARD_LOCATIONS } from '../../card/card.enums';

export type GameStateEntities = Record<
  string,
  PlayerViewModel | CardViewModel | ModifierViewModel | AbilityViewModel
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
        { entityType: 'ability' },
        entity => new AbilityViewModel(entity, dict, this.client)
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

  async onEvent(
    event: SerializedStarEvent,
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    if (event.eventName === GAME_EVENTS.MINION_SUMMONED) {
      return this.onMinionSummoned(event, flush);
    }

    if (event.eventName === GAME_EVENTS.ARTIFACT_EQUIPED) {
      return this.onArtifactEquiped(event, flush);
    }
  }

  private async onMinionSummoned(
    event: {
      event: SerializedEvent<'MINION_SUMMONED'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    const card = this.buildViewModel(event.event.card) as CardViewModel;
    this.state.entities[card.id] = card;

    const boardSide = this.state.board.sides.find(
      side => side.playerId === card.player.id
    )!;
    if (event.event.card.location === CARD_LOCATIONS.BASE) {
      boardSide.base = {
        ...boardSide.base,
        minions: [...boardSide.base.minions, card.id]
      };
    } else if (event.event.card.location === CARD_LOCATIONS.BATTLEFIELD) {
      boardSide.battlefield = {
        ...boardSide.battlefield,
        minions: [...boardSide.battlefield.minions, card.id]
      };
    }

    // @ts-expect-error force reactivity
    this.state.board.sides = this.state.board.sides.map(side => ({
      ...side
    }));

    return await flush();
  }

  private async onArtifactEquiped(
    event: {
      event: SerializedEvent<'ARTIFACT_EQUIPED'>;
    },
    flush: (postUpdateCallback?: () => Promise<void>) => Promise<void>
  ) {
    const card = this.buildViewModel(event.event.card) as CardViewModel;
    this.state.entities[card.id] = card;

    const boardSide = this.state.board.sides.find(
      side => side.playerId === card.player.id
    )!;
    boardSide.base.artifacts = [...boardSide.base.artifacts, card.id];

    // @ts-expect-error force reactivity
    this.state.board.sides = this.state.board.sides.map(side => ({
      ...side
    }));

    return await flush();
  }
}
