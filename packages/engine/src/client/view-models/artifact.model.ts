import type { SerializedTile } from '../../tile/tile.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { PlayerViewModel } from './player.model';
import type { SerializedPlayerArtifact } from '../../player/player-artifact.entity';
import type { CardViewModel } from './card.model';

export class ArtifactViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedPlayerArtifact,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: ArtifactViewModel | SerializedPlayerArtifact) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedPlayerArtifact>) {
    Object.assign(this.data, data);

    return this;
  }

  updateWithPatches(patches: PatchOperation[]) {
    this.data = this.getClient().patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new ArtifactViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get durability() {
    return this.data.durability;
  }

  get maxDurability() {
    return this.data.maxDurability;
  }

  get card() {
    return this.getEntities()[this.data.card] as CardViewModel;
  }
}
