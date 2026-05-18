import { isDefined, Vec2, type Point, type Serializable } from '@game/shared';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import { Interceptable } from '../utils/interceptable';
import { BOARD_ROWS, type BoardRow } from './map-blueprint';
import { pointToSpaceId } from './board-utils';
import { match } from 'ts-pattern';

export type BoardCellInterceptors = {
  isWalkable: Interceptable<boolean>;
};

export type SerializedCoords = `${string}:${string}`;

export type SerializedBoardSpace = {
  id: string;
  entityType: 'board-space';
  position: Point;
  player: 'p1' | 'p2';
  occupant: string | null;
};

export type BoardSpaceOptions = {
  position: Point;
  player: 'p1' | 'p2';
  row: BoardRow;
};

export class BoardSpace
  extends EntityWithModifiers<BoardCellInterceptors>
  implements Serializable<SerializedBoardSpace>
{
  readonly position: Vec2;

  constructor(
    protected game: Game,
    private options: BoardSpaceOptions
  ) {
    super(pointToSpaceId(options.position), game, {
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

  get player(): Player {
    if (this.options.player === 'p1') {
      return this.game.playerSystem.player1;
    } else {
      return this.game.playerSystem.player2;
    }
  }

  get shrine() {
    return null;
  }

  get isOccupied() {
    return isDefined(this.occupant);
  }

  get isEmpty() {
    return !this.isOccupied;
  }

  get occupant(): AnyCard | null {
    return this.game.cardSystem.getCardAt(this);
  }

  get row() {
    if (!this.options.player) return null;
    return this.options.row;
  }

  get inFront(): BoardSpace | null {
    if (!this.player) return null;
    if (!this.row) return null;
    const player = this.player;
    const row = this.row;

    return match(row)
      .with(BOARD_ROWS.FRONT, () => {
        return (
          this.game.boardSystem.spaces.find(
            c =>
              c.player?.equals(player.opponent) &&
              c.row === BOARD_ROWS.FRONT &&
              c.x == this.x
          ) ?? null
        );
      })
      .with(BOARD_ROWS.BACK, () => {
        return (
          this.game.boardSystem.spaces.find(
            c => c.player?.equals(player) && c.row === BOARD_ROWS.FRONT && c.x === this.x
          ) ?? null
        );
      })
      .exhaustive();
  }

  get behind(): BoardSpace | null {
    if (!this.player) return null;
    if (!this.row) return null;
    const player = this.player;
    const row = this.row;

    return match(row)
      .with(BOARD_ROWS.FRONT, () => {
        return (
          this.game.boardSystem.spaces.find(
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
    return this.game.boardSystem.spaces.find(c => c.y === this.y && c.x === this.x - 1);
  }

  get right() {
    return this.game.boardSystem.spaces.find(c => c.y === this.y && c.x === this.x + 1);
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

  serialize(): SerializedBoardSpace {
    return {
      id: this.id,
      entityType: 'board-space',
      position: this.position,
      player: this.options.player,
      occupant: this.occupant ? this.occupant.id : null
    };
  }
}
