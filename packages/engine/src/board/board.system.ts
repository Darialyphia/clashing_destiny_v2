import type { AnyCard } from '../card/entities/card.entity';
import { System } from '../system';
import type { BoardSide } from './board-side.entity';
import type { BoardRow } from './board-space.entity';

export type MinionSlot = number;

export type BoardCoordinates = {
  playerId: string;
  zone: BoardRow;
  index: number;
};

export class BoardSystem extends System<never> {
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

  getBoardSpaceAt({ playerId, zone, index }: BoardCoordinates) {
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
