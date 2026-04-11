import { isDefined, Vec2, type Point, type Serializable } from '@game/shared';
import type { Game } from '../../game/game';
import { pointToCellId } from '../board-utils';
import { EntityWithModifiers } from '../../utils/entity-with-modifiers';
import { Interceptable } from '../../utils/interceptable';
import { BOARD_ROWS, type BoardRow } from '../map-blueprint';
import { match } from 'ts-pattern';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/unit.entity';
import type { Tile } from '../../tile/tile.entity';

export type BoardCellInterceptors = {
  isWalkable: Interceptable<boolean>;
};

export type SerializedCoords = `${string}:${string}`;

export type SerializedCell = {
  id: string;
  entityType: 'cell';
  position: Point;
  player: 'p1' | 'p2' | null;
  unit: string | null;
  tile: string | null;
};

export type BoardCellOptions = {
  position: Point;
} & ({ player: 'p1' | 'p2'; row: BoardRow } | { player: null });

export class BoardCell
  extends EntityWithModifiers<BoardCellInterceptors>
  implements Serializable<SerializedCell>
{
  readonly position: Vec2;

  constructor(
    protected game: Game,
    private options: BoardCellOptions
  ) {
    super(pointToCellId(options.position), game, {
      isWalkable: new Interceptable()
    });
    this.position = Vec2.fromPoint(options.position);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get player(): Player | null {
    if (this.options.player === 'p1') {
      return this.game.playerSystem.player1;
    } else if (this.options.player === 'p2') {
      return this.game.playerSystem.player2;
    } else {
      return null;
    }
  }

  get unit(): Unit | null {
    return this.game.unitSystem.getUnitAt(this);
  }

  get tiles(): Tile | null {
    return this.game.tileSystem.getTileAt(this);
  }

  get shrine() {
    return null;
  }

  get isOccupied() {
    return isDefined(this.unit);
  }

  get isEmpty() {
    return !this.isOccupied;
  }

  get row() {
    if (!this.options.player) return null;
    return this.options.row;
  }

  get inFront(): BoardCell | null {
    if (!this.player) return null;
    if (!this.row) return null;
    const player = this.player;
    const row = this.row;

    return match(row)
      .with(BOARD_ROWS.FRONT, () => {
        return (
          this.game.boardSystem.cells.find(
            c =>
              c.player?.equals(player.opponent) &&
              c.row === BOARD_ROWS.FRONT &&
              c.x == this.x
          ) ?? null
        );
      })
      .with(BOARD_ROWS.BACK, () => {
        return (
          this.game.boardSystem.cells.find(
            c => c.player?.equals(player) && c.row === BOARD_ROWS.FRONT && c.x === this.x
          ) ?? null
        );
      })
      .exhaustive();
  }

  get behind(): BoardCell | null {
    if (!this.player) return null;
    if (!this.row) return null;
    const player = this.player;
    const row = this.row;

    return match(row)
      .with(BOARD_ROWS.FRONT, () => {
        return (
          this.game.boardSystem.cells.find(
            c => c.player?.equals(player) && c.row === BOARD_ROWS.BACK && c.x === this.x
          ) ?? null
        );
      })
      .with(BOARD_ROWS.BACK, () => {
        return null;
      })
      .exhaustive();
  }

  get left() {
    return this.game.boardSystem.cells.find(c => c.y === this.y && c.x === this.x - 1);
  }

  get right() {
    return this.game.boardSystem.cells.find(c => c.y === this.y && c.x === this.x + 1);
  }

  get adjacent() {
    return [this.left, this.right, this.inFront, this.behind].filter(isDefined);
  }

  isNearby(point: Point) {
    return this.game.boardSystem.getDistance(this.position, point) === 1;
  }

  get isFrontRow() {
    if (!this.options.player) return false;
    return this.options.row === BOARD_ROWS.FRONT;
  }

  get isBackRow() {
    if (!this.options.player) return false;
    return this.options.row === BOARD_ROWS.BACK;
  }

  serialize(): SerializedCell {
    return {
      id: this.id,
      entityType: 'cell',
      position: this.position,
      player: this.options.player,
      unit: this.unit ? this.unit.id : null,
      tile: this.tiles ? this.tiles.id : null
    };
  }
}
