import { Vec2, type Point } from '@game/shared';
import { Unit } from '../unit.entity';
import { UNIT_EVENTS } from '../unit.enums';
import { UnitAfterMoveEvent, UnitBeforeMoveEvent } from '../unit-events';
import type { Game } from '../../game/game';

export type MovementComponentOptions = {
  position: Point;
};

export class MovementComponent {
  position: Vec2;

  private _movementsCount = 0;

  constructor(
    private game: Game,
    private unit: Unit,
    options: MovementComponentOptions
  ) {
    this.position = Vec2.fromPoint(options.position);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get movementsCount() {
    return this._movementsCount;
  }

  isAt(point: Point) {
    return this.position.equals(point);
  }

  resetMovementsCount() {
    this._movementsCount = 0;
  }

  setMovementCount(count: number) {
    this._movementsCount = count;
  }

  canMoveTo(point: Point) {
    const cell = this.game.boardSystem.getCellAt(point);
    if (!cell) return false;
    return !!cell.player?.equals(this.unit.player) && !cell.isOccupied;
  }

  async move(to: Point) {
    await this.game.emit(
      UNIT_EVENTS.UNIT_BEFORE_MOVE,
      new UnitBeforeMoveEvent({
        unit: this.unit,
        position: Vec2.fromPoint(to)
      })
    );
    const currentPosition = this.position;

    this.position = Vec2.fromPoint(to);

    this._movementsCount++;

    await this.game.emit(
      UNIT_EVENTS.UNIT_AFTER_MOVE,
      new UnitAfterMoveEvent({
        unit: this.unit,
        position: this.position,
        previousPosition: currentPosition
      })
    );
  }
}
