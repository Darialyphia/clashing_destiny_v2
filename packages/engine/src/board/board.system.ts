import { type Serializable } from '@game/shared';
import type { AnyCard } from '../card/entities/card.entity';
import { System } from '../system';
import type { BoardSide, SerializedBoardSide } from './board-side.entity';

export type MinionSlot = number;

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

  serialize(): SerializedBoard {
    return {
      sides: this.sides.map(side => side.serialize()) as unknown as [
        SerializedBoardSide,
        SerializedBoardSide
      ]
    };
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
