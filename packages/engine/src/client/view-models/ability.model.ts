import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { SerializedAbility } from '../../card/entities/ability.entity';
import type { PatchOperation } from '../../game/systems/patch-types';
import { applyPatchToData } from '../utils/apply-patch';

export class AbilityViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedAbility,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: AbilityViewModel | SerializedAbility) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedModifier>) {
    this.data = Object.assign({}, this.data, data);
    return this;
  }

  applyPatch(patch: PatchOperation) {
    applyPatchToData(this.data, patch);
    return this;
  }

  clone() {
    return new AbilityViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get description() {
    return this.data.description;
  }

  get canUse() {
    return this.data.canUse;
  }

  get manaCost() {
    return this.data.manaCost;
  }
}
