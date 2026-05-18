import {
  indexToPoint,
  isDefined,
  isString,
  type Point,
  type Serializable
} from '@game/shared';
import { BoardSpace } from './board-space.entity';
import { System } from '../system';
import type { Player } from '../player/player.entity';
import { defaultMap, type MapBlueprint } from './map-blueprint';
import { pointToSpaceId } from './board-utils';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  spaces: string[];
};

export class BoardSystem
  extends System<BoardSystemOptions>
  implements Serializable<SerializedBoard>
{
  map!: MapBlueprint;

  spacesMap = new Map<string, BoardSpace>();

  dimensions!: { width: number; height: number };

  async initialize(options: BoardSystemOptions = { map: defaultMap }) {
    this.map = options.map;

    this.map.cells.forEach((blueprint, index) => {
      if (!blueprint) return;
      const position = indexToPoint(this.map.cols, index);
      const space = new BoardSpace(this.game, {
        position,
        ...blueprint
      });
      this.spacesMap.set(space.id, space);
    });

    this.dimensions = {
      width: options.map.cols,
      height: options.map.rows
    };

    await this.map.onInit(this.game);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  get width() {
    return this.map.cols;
  }

  get height() {
    return this.map.rows;
  }

  get spaces() {
    return [...this.spacesMap.values()];
  }

  getSpaceById(id: string) {
    return this.spacesMap.get(id) ?? null;
  }

  getRow(rowIndex: number) {
    return this.spaces.filter(space => space.y === rowIndex);
  }

  getColumn(colIndex: number) {
    return this.spaces.filter(space => space.x === colIndex);
  }

  getBackRowForPlayer(player: Player) {
    return this.spaces.filter(space => space.player?.equals(player) && space.isBackRow);
  }

  getFrontRowForPlayer(player: Player) {
    return this.spaces.filter(space => space.player?.equals(player) && space.isFrontRow);
  }

  getSpacesForPlayer(player: Player) {
    return [...this.getFrontRowForPlayer(player), ...this.getBackRowForPlayer(player)];
  }

  isInArea(topLeft: Point, size: { width: number; height: number }, point: Point) {
    return (
      point.x >= topLeft.x &&
      point.x < topLeft.x + size.width &&
      point.y >= topLeft.y &&
      point.y < topLeft.y + size.height
    );
  }

  getSpaceAt(posOrKey: string | Point): BoardSpace | null {
    if (isString(posOrKey)) {
      return this.spacesMap.get(posOrKey) ?? null;
    }
    return this.spacesMap.get(pointToSpaceId(posOrKey)) ?? null;
  }

  getDistance(origin: Point, point: Point): number {
    return Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  }

  getAdjacent(point: Point) {
    // get adjacent positions (non-diagonal)
    return [
      this.getSpaceAt({ x: point.x, y: point.y - 1 }), // top
      this.getSpaceAt({ x: point.x + 1, y: point.y }), // right
      this.getSpaceAt({ x: point.x, y: point.y + 1 }), // bottom
      this.getSpaceAt({ x: point.x - 1, y: point.y }) // left
    ].filter(isDefined);
  }

  getSpacesWithin(topLeft: Point, bottomRight: Point) {
    return [...this.spacesMap.values()].filter(
      space =>
        space.x >= topLeft.x &&
        space.x <= bottomRight.x &&
        space.y >= topLeft.y &&
        space.y <= bottomRight.y
    );
  }

  isNearby(from: Point, to: Point) {
    return this.getDistance(from, to) == 1;
  }

  serialize(): SerializedBoard {
    return {
      rows: this.height,
      columns: this.width,
      spaces: this.spaces.map(space => space.id)
    };
  }
}
