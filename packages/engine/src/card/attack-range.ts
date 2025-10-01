import type { BoardSlot } from '../board/board-slot.entity';
import { BOARD_SLOT_ZONES } from '../board/board.constants';
import type { Game } from '../game/game';
import type { MinionCard } from './entities/minion.entity';

export type AttackRange = {
  canAttack(position: BoardSlot): boolean;
  canAttackHero(): boolean;
};

export class MeleeAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}
  canAttack(position: BoardSlot) {
    if (position.slot !== this.minion.position!.slot) return false;

    if (position.zone === BOARD_SLOT_ZONES.BACK_ROW) {
      return !position.player.boardSide.frontRow.get(position.slot).minion;
    }

    return true;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).minion && !opponentBoard.backRow.get(slot).minion
    );
  }
}

export class RangedAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}

  canAttack(position: BoardSlot) {
    return position.slot === this.minion.position!.slot;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).minion && !opponentBoard.backRow.get(slot).minion
    );
  }
}

export class FlankAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}

  canAttack(position: BoardSlot) {
    return Math.abs(position.slot - this.minion.position!.slot) === 1;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).minion && !opponentBoard.backRow.get(slot).minion
    );
  }
}

export class AnywhereAttackRange implements AttackRange {
  canAttack() {
    return true;
  }

  canAttackHero(): boolean {
    return true;
  }
}
