import {
  isDefined,
  type BetterExtract,
  type EmptyObject,
  type Serializable
} from '@game/shared';
import { CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import { EntityWithModifiers } from '../modifier/entity-with-modifiers';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import { match } from 'ts-pattern';

export type BoardRow = BetterExtract<
  CardLocation,
  'base' | 'left_battlefield' | 'right_battlefield'
>;

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

export class BoardSpace
  extends EntityWithModifiers<EmptyObject>
  implements Serializable<SerializedBoardSpace>
{
  readonly position: BoardPosition;

  _card: AnyCard | null = null;

  constructor(
    protected game: Game,
    private options: BoardPosition
  ) {
    super(`${options.playerId}-${options.zone}-${options.index}`, game, {});
    this.position = options;
  }

  get zone() {
    return match(this.position.zone)
      .with(CARD_LOCATIONS.BASE, () => this.player.boardSide.base)
      .with(CARD_LOCATIONS.LEFT_BATTLEFIELD, () => this.player.boardSide.leftBattlefield)
      .with(
        CARD_LOCATIONS.RIGHT_BATTLEFIELD,
        () => this.player.boardSide.rightBattlefield
      )
      .exhaustive();
  }

  get index() {
    return this.position.index;
  }

  get adjacentSpaces() {
    return [this.zone[this.index - 1], this.zone[this.index + 1]].filter(isDefined);
  }

  get adjacentCards() {
    return this.adjacentSpaces.map(space => space.card).filter(isDefined);
  }

  getAdjacentCardsOfKind<CardType extends AnyCard>(type: CardType['kind']) {
    return this.adjacentCards.filter(card => card.kind === type) as unknown as CardType[];
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

  placeCard(card: AnyCard) {
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
