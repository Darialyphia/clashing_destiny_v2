import { assert, indexToPoint, type Point } from '@game/shared';
import { System } from '../system';
import { Tile } from './tile.entity';

export class TileSystem extends System<never> {
  private tileMap = new Map<string, Tile>();

  private nextTileId = 0;

  initialize() {}

  shutdown() {}

  get tiles() {
    return [...this.tileMap.values()];
  }

  getTileById(id: string) {
    return this.tileMap.get(id) ?? null;
  }

  getTileAt(position: Point) {
    return (
      this.tiles.find(tile => {
        return tile.position.equals(position);
      }) ?? null
    );
  }

  getBlueprint(id: string) {
    const blueprint = this.game.tilesPool[id];
    assert(blueprint, `Tile with id ${id} not found in tiles pool`);
    return blueprint;
  }

  isOccupied(position: Point) {
    return this.getTileAt(position) !== null;
  }

  async addTile(blueprintId: string, position: Point, playerId?: string) {
    if (this.isOccupied(position)) {
      await this.getTileAt(position)?.destroy();
    }

    const id = `tile_${++this.nextTileId}`;
    const tile = new Tile(this.game, {
      blueprint: this.getBlueprint(blueprintId),
      position,
      id,
      playerId: playerId
    });
    this.tileMap.set(tile.id, tile);

    await tile.checkOccupation();
    await tile.blueprint.onCreated(this.game, tile.occupant, tile);

    return tile;
  }

  removeTile(tile: Tile) {
    this.tileMap.delete(tile.id);
  }
}
