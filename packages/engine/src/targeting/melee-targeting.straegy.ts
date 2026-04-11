import { type Point3D } from '@game/shared';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';

export class MeleeTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private unit: Unit,
    private type: TargetingType
  ) {}

  isWithinRange(point: Point3D) {
    const cell = this.game.boardSystem.getCellAt(point);
    if (!cell) return false;
    if (this.unit.position.x !== cell.x) return false;
    if (!cell.player) return false;
    if (cell.player.equals(this.unit.player)) return false;
    if (!cell.unit && this.unit.enemiesOnSameColumn.length === 0) {
      return true; //attack player directly
    }
    const closestEnemy = this.unit.enemiesOnSameColumn.toSorted((a, b) => {
      const distA = Math.abs(a.position.y - this.unit.position.y);
      const distB = Math.abs(b.position.y - this.unit.position.y);
      return distA - distB;
    })[0];

    return cell.unit?.equals(closestEnemy) ?? false;
  }

  canTargetAt(point: Point3D) {
    if (!this.isWithinRange(point)) return false;
    const unit = this.game.unitSystem.getUnitAt(point);
    if (!unit) return true;

    return isValidTargetingType(this.game, point, this.unit.player, this.type);
  }
}
