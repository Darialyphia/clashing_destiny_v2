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
import type { MapBlueprint } from './map-blueprint';
import { pointToCellId } from './board-utils';

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

  cellsMap = new Map<string, BoardSpace>();

  dimensions!: { width: number; height: number };

  async initialize(options: BoardSystemOptions) {
    this.map = options.map;

    this.map.cells.forEach((cellBlueprint, index) => {
      if (!cellBlueprint) return;
      const position = indexToPoint(this.map.cols, index);
      const cell = new BoardSpace(this.game, {
        position,
        ...cellBlueprint
      });
      this.cellsMap.set(cell.id, cell);
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

  get cells() {
    return [...this.cellsMap.values()];
  }

  getRow(rowIndex: number) {
    return this.cells.filter(cell => cell.y === rowIndex);
  }

  getColumn(colIndex: number) {
    return this.cells.filter(cell => cell.x === colIndex);
  }

  getBackRowForPlayer(player: Player) {
    return this.cells.filter(cell => cell.player?.equals(player) && cell.isBackRow);
  }

  getFrontRowForPlayer(player: Player) {
    return this.cells.filter(cell => cell.player?.equals(player) && cell.isFrontRow);
  }

  getCellsForPlayer(player: Player) {
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

  getCellAt(posOrKey: string | Point): BoardSpace | null {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getDistance(origin: Point, point: Point): number {
    return Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  }

  getAdjacent(point: Point) {
    // get adjacent positions (non-diagonal)
    return [
      this.getCellAt({ x: point.x, y: point.y - 1 }), // top
      this.getCellAt({ x: point.x + 1, y: point.y }), // right
      this.getCellAt({ x: point.x, y: point.y + 1 }), // bottom
      this.getCellAt({ x: point.x - 1, y: point.y }) // left
    ].filter(isDefined);
  }

  getCellsWithin(topLeft: Point, bottomRight: Point) {
    return [...this.cellsMap.values()].filter(
      cell =>
        cell.x >= topLeft.x &&
        cell.x <= bottomRight.x &&
        cell.y >= topLeft.y &&
        cell.y <= bottomRight.y
    );
  }

  isNearby(from: Point, to: Point) {
    return this.getDistance(from, to) == 1;
  }

  serialize(): SerializedBoard {
    return {
      rows: this.height,
      columns: this.width,
      spaces: this.cells.map(cell => cell.id)
    };
  }
}
