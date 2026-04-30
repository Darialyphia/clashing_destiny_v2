import { type BetterExtract, type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { System } from '../system';
import type { BoardSide, SerializedBoardSide } from './board-side.entity';
import { CARD_DECK_SOURCES, type CardLocation } from '../card/card.enums';

export type MinionSlot = number;

export const isMainDeckCard = (card: AnyCard) => {
  return card.deckSource === CARD_DECK_SOURCES.MAIN_DECK;
};

export const isDestinyDeckCard = (card: AnyCard) => {
  return card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK;
};

export type SerializedBoard = {
  sides: [SerializedBoardSide, SerializedBoardSide];
};

export class BoardSystem extends System<never> implements Serializable<SerializedBoard> {
  initialize() {}
  shutdown() {}

  get sides(): [BoardSide, BoardSide] {
    return [
      this.game.playerSystem.player1.boardSide,
      this.game.playerSystem.player2.boardSide
    ];
  }

  getAllCardsInPlay(): AnyCard[] {
    return this.sides.flatMap(side => side.getAllCardsInPlay());
  }

  get boardSpaces() {
    return this.sides.flatMap(side => side.allSpaces);
  }

  getBoardSpaceById(id: string) {
    return this.boardSpaces.find(space => space.id === id) ?? null;
  }

  serialize(): SerializedBoard {
    return {
      sides: this.sides.map(side => side.serialize()) as unknown as [
        SerializedBoardSide,
        SerializedBoardSide
      ]
    };
  }

  getBoardSpace({
    playerId,
    zone,
    index
  }: {
    playerId: string;
    zone: BetterExtract<CardLocation, 'base' | 'battlefield'>;
    index: number;
  }) {
    const side = this.sides.find(side => side.player.id === playerId);
    return side?.getSpace(zone, index) ?? null;
  }
}

export class CreatureSlotAlreadyOccupiedError extends Error {
  constructor() {
    super('Creature slot is already occupied');
  }
}

export class ShardZoneAlreadyOccupiedError extends Error {
  constructor() {
    super('Shard zone is already occupied');
  }
}
