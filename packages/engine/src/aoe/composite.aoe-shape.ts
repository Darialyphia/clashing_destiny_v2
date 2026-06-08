import { type AOEShape } from './aoe-shape';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { BoardCoordinates } from '../board/board.system';

export class CompositeAOEShape implements AOEShape {
  readonly type = 'point' as const;

  constructor(
    private game: Game,
    private options: {
      player: Player;
      shapes: AOEShape[];
    }
  ) {}

  getArea([point]: [BoardCoordinates]) {
    const area = this.options.shapes.flatMap(shape => shape.getArea([point]));
    return [...new Set(area)];
  }
}
