import { isDefined, type Point3D } from '@game/shared';
import {
  isValidTargetingType,
  TARGETING_TYPE,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Game } from '../game/game';
import type { Unit } from '../unit/unit.entity';
import { ProvokeUnitModifier } from '../modifier/modifiers/provoke.modifier';

export class ProvokedTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  isWithinRange(point: Point3D) {
    const unit = this.game.unitSystem.getUnitAt(point);
    if (!unit) return false;

    return this.unit.unitsOnSameColumn.some(
      u => u.equals(unit) && u.modifiers.has(ProvokeUnitModifier)
    );
  }

  canTargetAt(point: Point3D) {
    if (!this.isWithinRange(point)) return false;
    const unit = this.game.unitSystem.getUnitAt(point);
    if (!unit) return true;

    return isValidTargetingType(this.game, point, this.unit.player, TARGETING_TYPE.UNIT);
  }
}
