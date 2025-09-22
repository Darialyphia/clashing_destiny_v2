import { isDefined } from '@game/shared';
import type { Game } from '../game/game';
import type { BoardMinionSlot } from './board-minion-slot.entity';
import { MINION_SLOT_ZONES } from './board;constants';

export class BoardColumn {
  readonly slots: BoardMinionSlot[];

  constructor(game: Game, column: number) {
    this.slots = game.boardSystem.sides
      .flatMap(side => [
        side.getSlot(MINION_SLOT_ZONES.FRONT_ROW, column),
        side.getSlot(MINION_SLOT_ZONES.BACK_ROW, column)
      ])
      .filter(isDefined);
  }

  get minions() {
    return this.slots.filter(slot => slot.isOccupied).map(slot => slot.minion!);
  }
}
