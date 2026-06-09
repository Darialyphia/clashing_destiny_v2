import { isDefined, type EmptyObject, type Serializable } from '@game/shared';
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
import type { Artifact } from '../card/entities/artifact.entity';

export type MinionSlot = number;

export type SerializedBoardSide = {
  playerId: string;
  hand: string[];
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
  base: string[];
  battlefield: string[];
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

  private readonly _battlefield: BoardSpace[];

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
    this._battlefield = Array.from(
      { length: game.config.BATTLEFIELD_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone: CARD_LOCATIONS.BATTLEFIELD,
          playerId: player.id
        })
    );
  }

  get base() {
    return this._base;
  }

  get battlefield() {
    return this._battlefield;
  }

  get allSpaces() {
    return [...this.base, ...this.battlefield];
  }

  getSpace(zone: BoardRow, index: number) {
    if (zone === 'base') {
      return this.base[index];
    }
    return this.battlefield[index];
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
      ...this.battlefield.flatMap(space => {
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
    } else if (zone === CARD_LOCATIONS.BATTLEFIELD) {
      if (!isMinion(card)) {
        throw new IllegalTargetError();
      }
      return this.placeCardInBattlefield(card, index);
    }
  }

  placeCardInBase(card: MinionCard | Artifact, index: number) {
    this._base[index].placeCard(card);
  }

  placeCardInBattlefield(card: MinionCard, index: number) {
    this._battlefield[index].placeCard(card);
  }

  removeFromBase(card: AnyCard) {
    const space = this._base.find(space => space.card?.equals(card));
    if (space) {
      space.removeCard();
    }
  }

  removeFromBattlefield(card: AnyCard) {
    const space = this._battlefield.find(space => space.card?.equals(card));
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
        this.removeFromBattlefield(card);
      })
      .exhaustive();
  }

  getCardInBase(cardId: string) {
    return this.base.map(space => space.card).find(card => card?.id === cardId) ?? null;
  }

  getCardInBattlefield(cardId: string) {
    return (
      this.battlefield.map(space => space.card).find(card => card?.id === cardId) ?? null
    );
  }

  isInBase(cardId: string) {
    return this.base.some(space => space.card?.id === cardId);
  }

  isInBattlefield(cardId: string) {
    return this.battlefield.some(space => space.card?.id === cardId);
  }

  private async moveToBattlefield(card: MinionCard, index: number) {
    await this.game.emit(
      GAME_EVENTS.CARD_BEFORE_MOVE,
      new CardBeforeMoveEvent({
        card: card,
        to: this.battlefield[index]
      })
    );
    const oldPos = card.position;
    this.removeFromBase(card);
    // place minion at the right index on the battlefield. If the space is already occupied, shift the other minions to the right until the end or until we hit an unoccupied board space
    let _minion = card;
    for (let i = index; i < this.battlefield.length; i++) {
      const space = this.battlefield[i];
      if (space.isEmpty) {
        space.placeCard(_minion);
        break;
      } else {
        const cardToShift = space.card!;
        space.placeCard(_minion);
        _minion = cardToShift as MinionCard;
      }
    }

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_MOVE,
      new CardAfterMoveEvent({
        card: card,
        from: oldPos!,
        to: this.battlefield[index]
      })
    );
  }

  private async moveToBase(card: MinionCard, index: number) {
    await this.game.emit(
      GAME_EVENTS.CARD_BEFORE_MOVE,
      new CardBeforeMoveEvent({
        card: card,
        to: this.base[index]
      })
    );
    const oldPos = card.position;
    this.removeFromBattlefield(card);

    // place minion at the right index on the baase. If the space is already occupied, shift the other minions to the right until the end or until we hit an unoccupied board space
    let _minion = card;
    for (let i = index; i < this.base.length; i++) {
      const space = this.base[i];
      if (space.isEmpty) {
        space.placeCard(_minion);
        break;
      } else {
        const cardToShift = space.card!;
        space.placeCard(_minion);
        _minion = cardToShift as MinionCard;
      }
    }

    await this.game.emit(
      GAME_EVENTS.CARD_AFTER_MOVE,
      new CardAfterMoveEvent({
        card: card,
        from: oldPos!,
        to: this.base[index]
      })
    );
  }

  async moveCard(id: string, index: number) {
    const cardInBase = this.getCardInBase(id);
    if (cardInBase && isMinion(cardInBase)) {
      await this.moveToBattlefield(cardInBase, index);
      return;
    }

    const cardInBattlefield = this.getCardInBattlefield(id);
    if (cardInBattlefield && isMinion(cardInBattlefield)) {
      await this.moveToBase(cardInBattlefield, index);
    }
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
      battlefield: this.battlefield.map(space => space.id)
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
