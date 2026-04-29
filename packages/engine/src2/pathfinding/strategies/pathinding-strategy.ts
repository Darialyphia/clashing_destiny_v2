import type { Point } from '@game/shared';
import type { Edge } from '../dijkstra';
import type { SerializedCoords } from '../../board/entities/board-cell.entity';

export type PathfindingStrategy = {
  getEdges(node: SerializedCoords): Array<Edge<SerializedCoords>>;
  setOrigin(origin: Point): void;
  done(): void;
};
