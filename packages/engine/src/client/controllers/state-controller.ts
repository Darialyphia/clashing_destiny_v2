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
import type { SerializedArtifactCard } from '../../card/entities/artifact.entity';
import type { SerializedAttackCard } from '../../card/entities/attack.entity';
import type { SerializedHeroCard } from '../../card/entities/hero.entity';
import type { SerializedLocationCard } from '../../card/entities/location.entity';
import type { SerializedMinionCard } from '../../card/entities/minion.card';
import type { SerializedSpellCard } from '../../card/entities/spell.entity';
import type { SerializedTalentCard } from '../../card/entities/talent.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedPlayer } from '../../player/player.entity';

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
      entities: {}
    };
    this.state.entities = this.buildentities(initialState.entities);
  }

  private buildViewModel(
    entity:
      | SerializedMinionCard
      | SerializedHeroCard
      | SerializedSpellCard
      | SerializedAttackCard
      | SerializedArtifactCard
      | SerializedLocationCard
      | SerializedTalentCard
      | SerializedPlayer
      | SerializedModifier
  ) {
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
  preupdate(newState: SerializedPlayerState | SerializedOmniscientState) {
    if (!this.state) return;

    for (const [id, entity] of Object.entries(newState.entities)) {
      const existingEntity = this.state.entities[id];
      if (existingEntity) continue;
      this.state.entities[entity.id] = this.buildViewModel(entity);
    }
  }

  update(newState: SerializedPlayerState | SerializedOmniscientState): void {
    this.state = {
      ...newState,
      entities: this.buildentities(newState.entities)
    };
  }
}
