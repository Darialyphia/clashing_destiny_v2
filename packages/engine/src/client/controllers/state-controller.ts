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
import type { GameClient } from '../client';

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
  state!: GameClientState;

  constructor(private client: GameClient) {}

  initialize(initialState: SerializedPlayerState | SerializedOmniscientState) {
    this.state = {
      ...initialState,
      entities: this.buildentities(initialState.entities)
    };
  }

  private buildentities = (entities: EntityDictionary): GameClientState['entities'] => {
    const dict: GameClientState['entities'] = this.state?.entities ?? {};
    for (const [id, entity] of Object.entries(entities)) {
      dict[id] = match(entity)
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
        .exhaustive();
    }
    return dict;
  };

  update(newState: SerializedPlayerState | SerializedOmniscientState): void {
    this.state = {
      ...newState,
      entities: this.buildentities(newState.entities)
    };
  }
}
