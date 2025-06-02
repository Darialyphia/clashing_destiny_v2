import type { Override } from '@game/shared';
import type {
  EntityDictionary,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../../game/systems/game-snapshot.system';
import { CardViewModel } from '../view-models/card.model';
import { ModifierViewModel } from '../view-models/modifier.model';
import { PlayerViewModel } from '../view-models/player.model';
import { match } from 'ts-pattern';
import type { NetworkAdapter } from '../client';

export type GameStateEntities = Record<
  string,
  PlayerViewModel | CardViewModel | ModifierViewModel
>;

export type GameClientState = Override<
  SerializedOmniscientState | SerializedPlayerState,
  {
    entities: GameStateEntities;
  }
>;

export class ClientStateController {
  private _state: GameClientState;

  constructor(
    initialState: SerializedPlayerState | SerializedOmniscientState,
    private adapter: NetworkAdapter
  ) {
    this._state = {
      ...initialState,
      entities: this.buildentities(initialState.entities, {})
    };
  }

  get state(): GameClientState {
    return this._state;
  }

  private buildentities = (
    entities: EntityDictionary,
    existing: GameStateEntities
  ): GameClientState['entities'] => {
    for (const [id, entity] of Object.entries(entities)) {
      existing[id] = match(entity)
        .with(
          { entityType: 'player' },
          entity => new PlayerViewModel(entity, existing, this.adapter.dispatch)
        )
        .with(
          { entityType: 'card' },
          entity => new CardViewModel(entity, existing, this.adapter.dispatch)
        )
        .with(
          { entityType: 'modifier' },
          entity => new ModifierViewModel(entity, existing, this.adapter.dispatch)
        )
        .exhaustive();
    }
    return existing;
  };

  update(newState: SerializedPlayerState | SerializedOmniscientState): void {
    this._state = {
      ...newState,
      entities: this.buildentities(newState.entities, this._state.entities)
    };
  }
}
