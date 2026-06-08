import { isDefined, type Point } from '@game/shared';
import {
  isValidAOETargetingType,
  type AOEShape,
  type AOETargetingType
} from './aoe-shape';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { BoardCoordinates } from '../board/board.system';

export class PointAOEShape implements AOEShape {
  readonly type = 'point' as const;

  constructor(
    private game: Game,
    private options: {
      targetingType: AOETargetingType;
      readonly override?: BoardCoordinates;
      player: Player;
    }
  ) {}

  getArea([point]: [BoardCoordinates]) {
    const area = this.options.override ?? point;

    if (!area) return [];

    return [area]
      .filter(space => {
        return isValidAOETargetingType(
          this.game,
          space,
          this.options.player,
          this.options.targetingType
        );
      })
      .map(space => this.game.boardSystem.getBoardSpaceAt(space))
      .filter(isDefined);
  }
}
