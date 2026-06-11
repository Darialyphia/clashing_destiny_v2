import {
  isDefined,
  type BetterExtract,
  type EmptyObject,
  type Serializable
} from '@game/shared';
import { MinionCard } from '../card/entities/minion.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARD_LOCATIONS } from '../card/card.enums';
import { GAME_EVENTS } from '../game/game.events';
import { isMinion, isArtifact } from '../card/card-utils';
import { BoardSpace, type BoardRow } from './board-space.entity';
import { IllegalTargetError } from '../input/input-errors';
import { CardAfterMoveEvent, CardBeforeMoveEvent } from '../card/card.events';
import type { ArtifactCard } from '../card/entities/artifact.entity';

export type MinionSlot = number;

export type SerializedBoardSide = {
  playerId: string;
  hand: string[];
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
  base: string[];
  leftBattlefield: string[];
  rightBattlefield: string[];
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  readonly player: Player;

  private readonly _base: BoardSpace[];

  private readonly _leftBattlefield: BoardSpace[];

  private readonly _rightBattlefield: BoardSpace[];

  constructor(
    private game: Game,
    player: Player
  ) {
    super(`board-side-${player.id}`, {});
    this.player = player;
    this._base = Array.from(
      { length: game.config.BASE_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone: CARD_LOCATIONS.BASE,
          playerId: player.id
        })
    );
    this._leftBattlefield = Array.from(
      { length: game.config.BATTLEFIELD_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone: CARD_LOCATIONS.LEFT_BATTLEFIELD,
          playerId: player.id
        })
    );
    this._rightBattlefield = Array.from(
      { length: game.config.BATTLEFIELD_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone: CARD_LOCATIONS.RIGHT_BATTLEFIELD,
          playerId: player.id
        })
    );
  }

  get base() {
    return this._base;
  }

  get leftBattlefield() {
    return this._leftBattlefield;
  }

  get rightBattlefield() {
    return this._rightBattlefield;
  }

  get allSpaces() {
    return [...this.base, ...this.leftBattlefield, ...this.rightBattlefield];
  }

  getSpace(zone: BoardRow, index: number) {
    return match(zone)
      .with('base', () => this.base[index])
      .with('left_battlefield', () => this.leftBattlefield[index])
      .with('right_battlefield', () => this.rightBattlefield[index])
      .exhaustive();
  }

  getAllCardsInPlay(): AnyCard[] {
    return [
      ...this.base.flatMap(space => {
        return [
          space.card,
          ...(space.card?.modifiers.list.flatMap(modifier =>
            Array.from(modifier.sources)
          ) ?? [])
        ].filter(isDefined);
      }),
      ...this.leftBattlefield.flatMap(space => {
        return [
          space.card,
          ...(space.card?.modifiers.list.flatMap(modifier =>
            Array.from(modifier.sources)
          ) ?? [])
        ].filter(isDefined);
      }),
      ...this.rightBattlefield.flatMap(space => {
        return [
          space.card,
          ...(space.card?.modifiers.list.flatMap(modifier =>
            Array.from(modifier.sources)
          ) ?? [])
        ].filter(isDefined);
      })
    ].filter(isDefined);
  }

  placeCard(card: AnyCard, zone: BoardRow, index: number) {
    if (zone === CARD_LOCATIONS.BASE) {
      if (!isMinion(card) && !isArtifact(card)) {
        throw new IllegalTargetError();
      }
      return this.placeCardInBase(card, index);
    } else if (zone === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      if (!isMinion(card)) {
        throw new IllegalTargetError();
      }
      return this.placeCardInLeftBattlefield(card, index);
    } else if (zone === CARD_LOCATIONS.RIGHT_BATTLEFIELD) {
      if (!isMinion(card)) {
        throw new IllegalTargetError();
      }
      return this.placeCardInRightBattlefield(card, index);
    }
  }

  placeCardInBase(card: MinionCard | ArtifactCard, index: number) {
    this._base[index].placeCard(card);
  }

  placeCardInLeftBattlefield(card: MinionCard, index: number) {
    this._leftBattlefield[index].placeCard(card);
  }

  placeCardInRightBattlefield(card: MinionCard, index: number) {
    this._rightBattlefield[index].placeCard(card);
  }

  removeFromBase(card: AnyCard) {
    const space = this._base.find(space => space.card?.equals(card));
    if (space) {
      space.removeCard();
    }
  }

  removeFromLeftBattlefield(card: AnyCard) {
    const space = this._leftBattlefield.find(space => space.card?.equals(card));
    if (space) {
      space.removeCard();
    }
  }

  removeFromRightBattlefield(card: AnyCard) {
    const space = this._rightBattlefield.find(space => space.card?.equals(card));
    if (space) {
      space.removeCard();
    }
  }

  remove(card: AnyCard) {
    match(card.kind)
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, () => {})
      .with(CARD_KINDS.ARTIFACT, () => {
        this.removeFromBase(card);
      })
      .with(CARD_KINDS.MINION, () => {
        this.removeFromBase(card);
        this.removeFromLeftBattlefield(card);
        this.removeFromRightBattlefield(card);
      })
      .exhaustive();
  }

  getCardInBase(cardId: string) {
    return this.base.map(space => space.card).find(card => card?.id === cardId) ?? null;
  }

  getCardInLeftBattlefield(cardId: string) {
    return (
      this.leftBattlefield.map(space => space.card).find(card => card?.id === cardId) ??
      null
    );
  }

  getCardInRightBattlefield(cardId: string) {
    return (
      this.rightBattlefield.map(space => space.card).find(card => card?.id === cardId) ??
      null
    );
  }

  isInBase(cardId: string) {
    return this.base.some(space => space.card?.id === cardId);
  }

  isInLeftBattlefield(cardId: string) {
    return this.leftBattlefield.some(space => space.card?.id === cardId);
  }

  isInRightBattlefield(cardId: string) {
    return this.rightBattlefield.some(space => space.card?.id === cardId);
  }

  isInBattlefield(cardId: string) {
    return this.isInLeftBattlefield(cardId) || this.isInRightBattlefield(cardId);
  }

  private async moveToBattlefield(
    card: MinionCard,
    battleField: BetterExtract<BoardRow, 'left_battlefield' | 'right_battlefield'>,
    index: number
  ) {
    const oldPos = card.position;
    const newPos =
      battleField === 'left_battlefield'
        ? this.leftBattlefield[index]
        : this.rightBattlefield[index];

    await this.game.emit(
      GAME_EVENTS.CARD_BEFORE_MOVE,
      new CardBeforeMoveEvent({
        card: card,
        to: newPos
      })
    );
    this.removeFromBase(card);
    // place minion at the right index on the battlefield. If the space is already occupied, shift the other minions to the right until the end or until we hit an unoccupied board space
    newPos.placeCard(card);

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_MOVE,
      new CardAfterMoveEvent({
        card: card,
        from: oldPos!,
        to: newPos
      })
    );
  }

  private async moveToBase(card: MinionCard, index: number) {
    const oldPos = card.position;
    const newPos = this.base[index];
    await this.game.emit(
      GAME_EVENTS.CARD_BEFORE_MOVE,
      new CardBeforeMoveEvent({
        card: card,
        to: newPos
      })
    );
    this.removeFromLeftBattlefield(card);
    this.removeFromRightBattlefield(card);

    newPos.placeCard(card);

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_MOVE,
      new CardAfterMoveEvent({
        card: card,
        from: oldPos!,
        to: newPos
      })
    );
  }

  async moveCard(id: string, zone: BoardRow, index: number) {
    const card = this.getAllCardsInPlay().find(card => card.id === id);
    if (!card) return;
    if (!isMinion(card)) return;

    await match(zone)
      .with(CARD_LOCATIONS.BASE, () => this.moveToBase(card, index))
      .with(CARD_LOCATIONS.LEFT_BATTLEFIELD, () =>
        this.moveToBattlefield(card, CARD_LOCATIONS.LEFT_BATTLEFIELD, index)
      )
      .with(CARD_LOCATIONS.RIGHT_BATTLEFIELD, () =>
        this.moveToBattlefield(card, CARD_LOCATIONS.RIGHT_BATTLEFIELD, index)
      )
      .exhaustive();
  }

  serialize(): SerializedBoardSide {
    return {
      playerId: this.player.id,
      banishPile: [...this.player.cardManager.banishPile].map(card => card.id),
      discardPile: [...this.player.cardManager.discardPile].map(card => card.id),
      hand: this.player.cardManager.hand.map(card => card.id),
      mainDeck: {
        total: this.player.cardManager.mainDeckSize,
        remaining: this.player.cardManager.remainingCardsInMainDeck
      },
      base: this.base.map(space => space.id),
      leftBattlefield: this.leftBattlefield.map(space => space.id),
      rightBattlefield: this.rightBattlefield.map(space => space.id)
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
