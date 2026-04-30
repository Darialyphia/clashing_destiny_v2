import {
  isDefined,
  type BetterExtract,
  type EmptyObject,
  type Serializable
} from '@game/shared';
import type { CardLocation } from '../card/card.enums';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';

export type BoardRow = BetterExtract<CardLocation, 'base' | 'battlefield'>;

export type BoardPosition = {
  playerId: string;
  zone: BoardRow;
  index: number;
};

export type SerializedBoardSpace = {
  id: string;
  entityType: 'board-space';
  position: BoardPosition;
  card: string | null;
  player: string;
};

export type BoardSpaceOptions = {
  playerId: string;
  zone: BoardRow;
  index: number;
};

export class BoardSpace<T extends AnyCard>
  extends EntityWithModifiers<EmptyObject>
  implements Serializable<SerializedBoardSpace>
{
  readonly position: BoardPosition;

  _card: T | null = null;

  constructor(
    protected game: Game,
    private options: BoardPosition
  ) {
    super(`${options.playerId}-${options.zone}-${options.index}`, game, {});
    this.position = options;
  }

  get zone() {
    if (this.position.zone === 'base') {
      return this.player.boardSide.base;
    }
    return this.player.boardSide.battlefield;
  }

  get index() {
    return this.position.index;
  }

  get player(): Player {
    return this.game.playerSystem.getPlayerById(this.position.playerId)!;
  }

  get card() {
    return this._card;
  }

  get isOccupied() {
    return isDefined(this.card);
  }

  get isEmpty() {
    return !this.isOccupied;
  }

  placeCard(card: T) {
    this._card = card;
  }

  removeCard() {
    this._card = null;
  }

  serialize(): SerializedBoardSpace {
    return {
      id: this.id,
      entityType: 'board-space',
      position: this.position,
      player: this.player.id,
      card: this.card?.id ?? null
    };
  }
}
