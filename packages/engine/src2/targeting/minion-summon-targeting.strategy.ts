import { type Point } from '@game/shared';
import type { TargetingStrategy } from './targeting-strategy';
import type { Game } from '../game/game';
import type { MinionCard } from '../card/entities/minion-card.entity';

export class MinionSummonTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private card: MinionCard
  ) {}

  private isPointValid(point: Point) {
    return (
      this.card.player.units.some(
        unit => this.game.boardSystem.getDistance(unit.position, point) === 1
      ) && !this.game.boardSystem.getCellAt(point)?.isOccupied
    );
  }

  isWithinRange(point: Point) {
    return this.isPointValid(point);
  }

  canTargetAt(point: Point) {
    return this.isPointValid(point);
  }
}
