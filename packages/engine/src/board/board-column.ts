import { isDefined } from '@game/shared';
import type { Game } from '../game/game';
import type { BoardMinionSlot } from './board-minion-slot.entity';

export class BoardColumn {
  readonly slots: BoardMinionSlot[];

  constructor(game: Game, column: number) {
    this.slots = game.boardSystem.sides
      .flatMap(side => [side.getSlot('attack', column), side.getSlot('defense', column)])
      .filter(isDefined);
  }

  get minions() {
    return this.slots.filter(slot => slot.isOccupied).map(slot => slot.minion!);
  }
}
