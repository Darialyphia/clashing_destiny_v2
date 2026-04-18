import type { SerializedCell } from '../../board/entities/board-cell.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { PatchOperation } from '../../game/systems/patch-types';
import type { GameClient, GameStateEntities } from '../client';
import type { TileViewModel } from './tile.model';
import type { UnitViewModel } from './unit.model';

export class BoardCellViewModel {
  private getEntities: () => GameStateEntities;

  private getClient: () => GameClient;

  constructor(
    private data: SerializedCell,
    entityDictionary: GameStateEntities,
    client: GameClient
  ) {
    this.getEntities = () => entityDictionary;
    this.getClient = () => client;
  }

  equals(unit: BoardCellViewModel | SerializedCell) {
    return this.id === unit.id;
  }

  update(data: Partial<SerializedCell>) {
    Object.assign(this.data, data);

    return this;
  }

  updateWithPatches(patches: PatchOperation[]) {
    this.data = this.getClient().patchApplier.applyPatches(this.data, patches);
    return this;
  }

  clone() {
    return new BoardCellViewModel(this.data, this.getEntities(), this.getClient());
  }

  get id() {
    return this.data.id;
  }

  get player() {
    return this.data.player;
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

  get isEmpty() {
    return !this.data.unit;
  }

  get unit() {
    const unit = this.data.unit;
    if (!unit) return null;
    return this.getEntities()[unit] as UnitViewModel;
  }

  get tile() {
    const tile = this.data.tile;
    if (!tile) return null;
    return this.getEntities()[tile] as TileViewModel;
  }
}
