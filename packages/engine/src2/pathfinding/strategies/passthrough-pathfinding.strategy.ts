import { Vec2, isDefined, type Point, type Point3D } from '@game/shared';
import type { Game } from '../../game/game';
import type { Edge } from '../dijkstra';
import type { PathfindingStrategy } from './pathinding-strategy';
import { pointToCellId } from '../../board/board-utils';
import type { Unit } from '../../unit/unit.entity';
import type { BoardCell, SerializedCoords } from '../../board/entities/board-cell.entity';

export type SolidPathfindingStrategyOptions = {
  origin: Point3D;
};

/**
 * A pathfinding strategy for solid bodies that cannot pass through other bodies
 */
export class PassThroughPathfindingStrategy implements PathfindingStrategy {
  private cache = new Map<SerializedCoords, Edge<SerializedCoords>[]>();

  private origin!: Vec2;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  done() {
    this.cache.clear();
  }

  setOrigin(origin: Point) {
    this.origin = Vec2.fromPoint(origin);
  }

  computeNeighbors(node: SerializedCoords) {
    const cell = this.game.boardSystem.getCellAt(node)!;
    const edges = this.game.boardSystem.getAdjacent(cell.position);

    const result: Array<{ node: SerializedCoords; weight: number }> = [];

    for (let i = 0; i <= edges.length; i++) {
      const edge = edges[i];
      if (isDefined(edge) && this.isEdgeValid(edge)) {
        result.push({ node: pointToCellId(edge), weight: 1 });
      }
    }

    this.cache.set(node, result);
  }

  isEdgeValid(cell: BoardCell) {
    if (this.origin.equals(cell)) return false;
    return true;
  }

  getEdges(node: SerializedCoords): Array<Edge<SerializedCoords>> {
    if (!this.cache.has(node)) {
      this.computeNeighbors(node);
    }
    return this.cache.get(node)!;
  }
}
