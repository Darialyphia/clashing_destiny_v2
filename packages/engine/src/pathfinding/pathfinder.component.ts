import { Vec2, type Point } from '@game/shared';
import { dijkstra, findShortestPath } from './dijkstra';
import type { Game } from '../game/game';
import { cellIdToPoint, pointToCellId } from '../board/board-utils';
import type { PathfindingStrategy } from './strategies/pathinding-strategy';
import type { SerializedCoords } from '../board/entities/board-cell.entity';

export type DistanceMap = {
  costs: ReturnType<typeof dijkstra>['costs'];
  get: (point: Point) => number;
};

export class PathfinderComponent {
  constructor(
    private game: Game,
    private getStrategy: () => PathfindingStrategy
  ) {}

  get strategy() {
    return this.getStrategy();
  }

  getDistanceMap(from: Point, maxDistance?: number): DistanceMap {
    const strategy = this.strategy;
    strategy.setOrigin(from);

    const map = dijkstra(strategy, {
      startNode: pointToCellId(from),
      maxWeight: maxDistance
    });

    strategy.done();

    return {
      costs: map.costs,
      get(pt: Point) {
        return map.costs[pointToCellId(pt)];
      }
    };
  }

  getPathTo(from: Point, to: Point, maxDistance?: number) {
    const entityAtPoint = this.game.unitSystem.getUnitAt(to);
    if (entityAtPoint) return null;

    const strategy = this.strategy;
    strategy.setOrigin(from);

    const path = findShortestPath<SerializedCoords>(
      strategy,
      pointToCellId(from),
      pointToCellId(to),
      maxDistance
    );

    if (!path) return null;
    strategy.done();

    return {
      distance: path.distance,
      path: path.path.map(p => Vec2.fromPoint(cellIdToPoint(p)))
    };
  }
}
