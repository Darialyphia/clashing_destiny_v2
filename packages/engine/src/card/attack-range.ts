import type { BoardMinionSlot } from '../board/board-minion-slot.entity';
import { MINION_SLOT_ZONES } from '../board/board;constants';
import type { Game } from '../game/game';
import type { MinionCard } from './entities/minion.entity';

export type AttackRange = {
  canAttack(position: BoardMinionSlot): boolean;
  canAttackHero(): boolean;
};

export class MeleeAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}
  canAttack(position: BoardMinionSlot) {
    if (position.slot !== this.minion.position!.slot) return false;

    if (position.zone === MINION_SLOT_ZONES.BACK_ROW) {
      return position.player.boardSide.frontRow.get(position.slot).isOccupied;
    }

    return true;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).isOccupied &&
      !opponentBoard.backRow.get(slot).isOccupied
    );
  }
}

export class RangedAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}

  canAttack(position: BoardMinionSlot) {
    return position.slot === this.minion.position!.slot;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).isOccupied &&
      !opponentBoard.backRow.get(slot).isOccupied
    );
  }
}

export class FlankAttackRange implements AttackRange {
  constructor(
    private game: Game,
    private minion: MinionCard
  ) {}

  canAttack(position: BoardMinionSlot) {
    return Math.abs(position.slot - this.minion.position!.slot) === 1;
  }

  canAttackHero(): boolean {
    const opponentBoard = this.minion.player.opponent.boardSide;
    const slot = this.minion.position!.slot;

    return (
      !opponentBoard.frontRow.get(slot).isOccupied &&
      !opponentBoard.backRow.get(slot).isOccupied
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
