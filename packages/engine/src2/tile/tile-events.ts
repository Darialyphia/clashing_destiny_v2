import type { Tile, SerializedTile } from './tile.entity';
import type { Unit } from '../unit/unit.entity';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { TILE_EVENTS } from './tile-enums';

export class TileCreatedEvent extends TypedSerializableEvent<
  { tile: Tile },
  { tile: SerializedTile }
> {
  serialize() {
    return {
      tile: this.data.tile.serialize()
    };
  }
}

export class TileBeforeDestroyEvent extends TypedSerializableEvent<
  { tile: Tile },
  { tile: SerializedTile }
> {
  serialize() {
    return {
      tile: this.data.tile.serialize()
    };
  }
}

export class TileAfterDestroyEvent extends TypedSerializableEvent<
  { tile: Tile },
  { tile: SerializedTile }
> {
  serialize() {
    return {
      tile: this.data.tile.serialize()
    };
  }
}

export class TileEnterEvent extends TypedSerializableEvent<
  { tile: Tile; unit: Unit },
  { tile: string; unit: string }
> {
  serialize() {
    return {
      tile: this.data.tile.id,
      unit: this.data.unit.id
    };
  }
}

export class TileLeaveEvent extends TypedSerializableEvent<
  { tile: Tile },
  { tile: string }
> {
  serialize() {
    return {
      tile: this.data.tile.id
    };
  }
}

export type TileEventMap = {
  [TILE_EVENTS.TILE_CREATED]: TileCreatedEvent;
  [TILE_EVENTS.TILE_BEFORE_DESTROY]: TileBeforeDestroyEvent;
  [TILE_EVENTS.TILE_AFTER_DESTROY]: TileAfterDestroyEvent;
  [TILE_EVENTS.TILE_ENTER]: TileEnterEvent;
  [TILE_EVENTS.TILE_LEAVE]: TileLeaveEvent;
};
