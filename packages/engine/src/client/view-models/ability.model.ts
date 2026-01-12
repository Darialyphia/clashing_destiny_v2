import type { SerializedAbility } from '../../card/card-blueprint';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { GameClient, GameStateEntities } from '../client';
import { PatchApplier } from '../patch-applier';
import type { PatchOperation } from '../../game/systems/patch-types';

export class AbilityViewModel {
  private static patchApplier = new PatchApplier();
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

  /**
   * Update using patch operations for granular changes
   */
  updateWithPatches(patches: PatchOperation[]) {
    this.data = AbilityViewModel.patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new AbilityViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get abilityId() {
    return this.data.abilityId;
  }

  get name() {
    return this.data.name;
  }

  get description() {
    return this.data.description;
  }

  get isHiddenOnCard() {
    return this.data.isHiddenOnCard;
  }

  get shouldExhaust() {
    return this.data.shouldExhaust;
  }

  get speed() {
    return this.data.speed;
  }

  get canUse() {
    return this.data.canUse;
  }

  get manaCost() {
    return this.data.manaCost;
  }

  get targets() {
    return this.data.targets;
  }
}
