import type { SerializedTile } from '../../tile/tile.entity';
import type { GameClient, GameStateEntities } from '../client';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { PlayerViewModel } from './player.model';

export class TileViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedTile,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: TileViewModel | SerializedTile) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedTile>) {
    Object.assign(this.data, data);

    return this;
  }

  updateWithPatches(patches: PatchOperation[]) {
    this.data = this.getClient().patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new TileViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  get player() {
    if (!this.data.playerId) return null;
    return this.getEntities()[this.data.playerId] as PlayerViewModel;
  }

  get position() {
    return this.data.position;
  }

  get x() {
    return this.data.position.x;
  }

  get y() {
    return this.data.position.y;
  }
}
