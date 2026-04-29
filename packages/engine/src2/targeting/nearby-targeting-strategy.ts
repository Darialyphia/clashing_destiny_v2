import { type Point } from '@game/shared';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';

export class NearbyTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private player: Player,
    private getOrigins: () => Point[],
    private type: TargetingType
  ) {}

  isWithinRange(point: Point) {
    return this.getOrigins().some(
      origin => this.game.boardSystem.getDistance(origin, point) === 1
    );
  }

  canTargetAt(point: Point) {
    if (!this.isWithinRange(point)) return false;

    return isValidTargetingType(this.game, point, this.player, this.type);
  }
}
