import { isDefined } from '@game/shared';
import type { Game } from '../game/game';
import type { BoardSlot } from './board-slot.entity';
import { BOARD_SLOT_ZONES } from './board.constants';

export class BoardColumn {
  readonly slots: BoardSlot[];

  constructor(game: Game, column: number) {
    this.slots = game.boardSystem.sides
      .flatMap(side => [
        side.getSlot(BOARD_SLOT_ZONES.FRONT_ROW, column),
        side.getSlot(BOARD_SLOT_ZONES.BACK_ROW, column)
      ])
      .filter(isDefined);
  }

  get minions() {
    return this.slots.filter(slot => slot.isOccupied).map(slot => slot.minion!);
  }

  get sigils() {
    return this.slots.filter(slot => slot.isOccupied).map(slot => slot.sigil!);
  }
}
