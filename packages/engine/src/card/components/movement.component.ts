import { Vec2, type Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AnyCard } from '../entities/card.entity';
import { GAME_EVENTS } from '../../game/game.events';
import { CardAfterMoveEvent, CardBeforeMoveEvent } from '../card.events';
import type { BoardSpace } from '../../board/board-space.entity';

export type MovementComponentOptions = {
  position: Point | null;
};

export class MovementComponent {
  coordinates: Vec2 | null;

  private _movementsCount = 0;

  constructor(
    private game: Game,
    private card: AnyCard,
    options: MovementComponentOptions
  ) {
    this.coordinates = options.position ? Vec2.fromPoint(options.position) : null;
  }

  get space() {
    if (!this.coordinates) return null;

    return this.game.boardSystem.getCellAt(this.coordinates);
  }

  get x() {
    return this.coordinates?.x ?? null;
  }

  get y() {
    return this.coordinates?.y ?? null;
  }

  get movementsCount() {
    return this._movementsCount;
  }

  isAt(point: Point) {
    return this.coordinates?.equals(point) ?? false;
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
    if (!cell.player?.equals(this.card.player)) return false;
    if (cell.isOccupied) return false;

    return this.card.isValidPosition(cell);
  }

  async move(to: BoardSpace) {
    await this.game.emit(
      GAME_EVENTS.CARD_BEFORE_MOVE,
      new CardBeforeMoveEvent({
        card: this.card,
        to
      })
    );
    const currentPosition = this.space!;

    this.coordinates = Vec2.fromPoint(to);

    this._movementsCount++;

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_MOVE,
      new CardAfterMoveEvent({
        card: this.card,
        from: currentPosition,
        to
      })
    );
  }
}
