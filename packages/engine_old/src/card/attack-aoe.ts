import { isDefined } from '@game/shared';
import type { BoardSlot } from '../board/board-slot.entity';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import { match } from 'ts-pattern';
import { BOARD_SLOT_ROWS } from '../board/board.constants';

export type AttackAOE = {
  getAffectedCards(position: BoardSlot): Array<MinionCard | HeroCard>;
};

export class SingleTargetAOE implements AttackAOE {
  getAffectedCards(position: BoardSlot) {
    return position.minion ? [position.minion] : [];
  }
}

export class CleaveAOE implements AttackAOE {
  getAffectedCards(position: BoardSlot) {
    return [position.minion, position.left?.minion, position.right?.minion].filter(
      isDefined
    );
  }
}

export class PiercingAOE implements AttackAOE {
  getAffectedCards(position: BoardSlot) {
    return match(position.row)
      .with(BOARD_SLOT_ROWS.FRONT_ROW, () => {
        return [position.minion, position.behind?.minion].filter(isDefined);
      })
      .with(BOARD_SLOT_ROWS.BACK_ROW, () => {
        return [position.minion, position.inFront?.minion].filter(isDefined);
      })
      .exhaustive();
  }
}

export class BlastAOE implements AttackAOE {
  getAffectedCards(position: BoardSlot) {
    return [position.minion, ...position.adjacentMinions].filter(isDefined);
  }
}
