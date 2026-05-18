import { isDefined, type Point } from '@game/shared';
import {
  isValidAOETargetingType,
  type AOEShape,
  type AOETargetingType
} from './aoe-shape';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';

export class PointAOEShape implements AOEShape {
  readonly type = 'point' as const;

  constructor(
    private game: Game,
    private options: {
      targetingType: AOETargetingType;
      readonly override?: Point;
      player: Player;
    }
  ) {}

  getArea([point]: [Point]) {
    const area = this.options.override ?? point;
    if (!area) return [];

    return [area]
      .map(point => this.game.boardSystem.getSpaceAt(point))
      .filter(isDefined)
      .filter(space =>
        isValidAOETargetingType(
          this.game,
          space,
          this.options.player,
          this.options.targetingType
        )
      );
  }
}
