import { isDefined, type Point } from '@game/shared';
import {
  isValidAOETargetingType,
  type AOEShape,
  type AOETargetingType
} from './aoe-shape';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';

export class CompositeAOEShape implements AOEShape {
  readonly type = 'point' as const;

  constructor(
    private game: Game,
    private options: {
      player: Player;
      shapes: AOEShape[];
    }
  ) {}

  getArea([point]: [Point]) {
    const area = this.options.shapes.flatMap(shape => shape.getArea([point]));
    return [...new Set(area)];
  }
}
