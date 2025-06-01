import type { InputDispatcher } from '../../input/input-system';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameStateEntities } from '../client';
import type { CardViewModel } from './card.model';

export class ModifierViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedModifier,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

  equals(unit: ModifierViewModel | SerializedModifier) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  get modifierType() {
    return this.data.modifierType;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get icon() {
    return this.data.icon;
  }

  get targetAsCard() {
    return this.getEntities()[this.data.target] as CardViewModel;
  }
}
