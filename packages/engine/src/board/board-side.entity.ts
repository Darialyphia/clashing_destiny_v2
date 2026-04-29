import { isDefined, type EmptyObject, type Serializable } from '@game/shared';
import { MinionCard, type SerializedMinionCard } from '../card/entities/minion.entity';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero.entity';
import type {
  ArtifactCard,
  SerializedArtifactCard
} from '../card/entities/artifact.entity';
import type { SerializedSpellCard } from '../card/entities/spell.entity';
import type { Player } from '../player/player.entity';
import type { AnyCard } from '../card/entities/card.entity';
import type { Game } from '../game/game';
import { Entity } from '../entity';
import { match } from 'ts-pattern';
import { CARD_KINDS, CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import { GAME_EVENTS } from '../game/game.events';
import { MinionMoveEvent } from '../card/events/minion.events';
import { isArtifact, isHero, isMinion } from '../card/card-utils';
import {
  BoardSpace,
  type BoardRow,
  type SerializedBoardSpace
} from './board-space.entity';
import { IllegalTargetError } from '../input/input-errors';

export type MinionSlot = number;

export type SerializedMainDeckCard =
  | SerializedMinionCard
  | SerializedSpellCard
  | SerializedArtifactCard;

export type DestinyDeckCard = HeroCard;
export type SerializedDestinyDeckCard = SerializedHeroCard;

export type SerializedBoardSide = {
  playerId: string;
  hand: string[];
  mainDeck: { total: number; remaining: number };
  discardPile: string[];
  banishPile: string[];
  base: SerializedBoardSpace[];
  battlefield: SerializedBoardSpace[];
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export type BoardBase = Array<BoardSpace<MinionCard | ArtifactCard>>;

export type BoardBattlefield = Array<BoardSpace<MinionCard | HeroCard>>;

export class BoardSide
  extends Entity<EmptyObject>
  implements Serializable<SerializedBoardSide>
{
  readonly player: Player;

  private readonly _base: BoardBase;

  readonly _battlefield: BoardBattlefield;

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
      if (!isMinion(card) && !isHero(card)) {
        throw new IllegalTargetError();
      }
      return this.placeCardInBattlefield(card, index);
    }
  }

  placeCardInBase(card: MinionCard | ArtifactCard, index: number) {
    this._base[index].placeCard(card);
  }

  placeCardInBattlefield(card: MinionCard | HeroCard, index: number) {
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
      .with(CARD_KINDS.HERO, CARD_KINDS.SPELL, CARD_KINDS.DESTINY, () => {})
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

  private async moveMinionToBattlefield(minion: MinionCard, index: number) {
    await this.game.emit(
      GAME_EVENTS.MINION_BEFORE_MOVE,
      new MinionMoveEvent({
        card: minion,
        from: CARD_LOCATIONS.BASE,
        to: CARD_LOCATIONS.BATTLEFIELD
      })
    );
    this.removeFromBase(minion);

    // place minion at the right index on the battlefield. If the space is already occupied, shift the other minions to the right until the end or until we hit an unoccupied board space
    let _minion = minion;
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
      GAME_EVENTS.MINION_AFTER_MOVE,
      new MinionMoveEvent({
        card: minion,
        from: CARD_LOCATIONS.BASE,
        to: CARD_LOCATIONS.BATTLEFIELD
      })
    );
  }

  private async moveMinionToBase(minion: MinionCard, index: number) {
    await this.game.emit(
      GAME_EVENTS.MINION_BEFORE_MOVE,
      new MinionMoveEvent({
        card: minion,
        from: CARD_LOCATIONS.BATTLEFIELD,
        to: CARD_LOCATIONS.BASE
      })
    );
    this.removeFromBattlefield(minion);

    // place minion at the right index on the baase. If the space is already occupied, shift the other minions to the right until the end or until we hit an unoccupied board space
    let _minion = minion;
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
      GAME_EVENTS.MINION_AFTER_MOVE,
      new MinionMoveEvent({
        card: minion,
        from: CARD_LOCATIONS.BATTLEFIELD,
        to: CARD_LOCATIONS.BASE
      })
    );
  }

  async moveMinion(id: string, index: number) {
    const cardInBase = this.getCardInBase(id);
    if (cardInBase && isMinion(cardInBase)) {
      if (isMinion(cardInBase)) return;
      await this.moveMinionToBattlefield(cardInBase, index);
      return;
    }

    const cardInBattlefield = this.getCardInBattlefield(id);
    if (cardInBattlefield && isMinion(cardInBattlefield)) {
      await this.moveMinionToBase(cardInBattlefield, index);
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
      base: this.base.map(space => space.serialize()),
      battlefield: this.battlefield.map(space => space.serialize())
    };
  }
}

export class BoardSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Board slot is already occupied');
  }
}
