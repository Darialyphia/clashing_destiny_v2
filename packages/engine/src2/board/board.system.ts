import {
  indexToPoint,
  isDefined,
  isString,
  type Point,
  type Serializable
} from '@game/shared';
import { BoardCell } from './entities/board-cell.entity';
import { pointToCellId } from './board-utils';
import { System } from '../system';
import type { MapBlueprint } from './map-blueprint';
import type { Player } from '../player/player.entity';

export type BoardSystemOptions = {
  map: MapBlueprint;
};

export type SerializedBoard = {
  rows: number;
  columns: number;
  cells: string[];
  shrines: string[];
  teleporters: string[];
};

export class BoardSystem
  extends System<BoardSystemOptions>
  implements Serializable<SerializedBoard>
{
  map!: MapBlueprint;

  cellsMap = new Map<string, BoardCell>();

  dimensions!: { width: number; height: number };

  async initialize(options: BoardSystemOptions) {
    this.map = options.map;

    this.map.cells.forEach((cellBlueprint, index) => {
      if (!cellBlueprint) return;
      const position = indexToPoint(this.map.cols, index);
      const cell = new BoardCell(this.game, {
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

  getCellAt(posOrKey: string | Point): BoardCell | null {
    if (isString(posOrKey)) {
      return this.cellsMap.get(posOrKey) ?? null;
    }
    return this.cellsMap.get(pointToCellId(posOrKey)) ?? null;
  }

  getDistance(origin: Point, point: Point): number {
    return Math.max(Math.abs(point.x - origin.x), Math.abs(point.y - origin.y));
  }

  getNeighbors(point: Point) {
    // get neighboring positions in a clockwise order
    return [
      this.getCellAt({ x: point.x - 1, y: point.y - 1 }), // top left
      this.getCellAt({ x: point.x, y: point.y - 1 }), // top
      this.getCellAt({ x: point.x + 1, y: point.y - 1 }), // top right
      this.getCellAt({ x: point.x + 1, y: point.y }), // right
      this.getCellAt({ x: point.x + 1, y: point.y + 1 }), // bottom right
      this.getCellAt({ x: point.x, y: point.y + 1 }), // bottom
      this.getCellAt({ x: point.x - 1, y: point.y + 1 }), // bottom left,
      this.getCellAt({ x: point.x - 1, y: point.y }) // left
    ].filter(isDefined);
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

  getNearbyShrines({ x, y }: Point) {
    return this.game.boardSystem
      .getNeighbors({ x, y })
      .map(cell => cell.shrine)
      .filter(isDefined);
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
      cells: this.cells.map(cell => cell.id),
      shrines: [],
      teleporters: []
    };
  }
}
