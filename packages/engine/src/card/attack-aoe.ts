import { isDefined } from '@game/shared';
import type { BoardSlot } from '../board/board-slot.entity';
import { BOARD_SLOT_ZONES } from '../board/board.constants';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import { match } from 'ts-pattern';

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
    return match(position.zone)
      .with(BOARD_SLOT_ZONES.FRONT_ROW, () => {
        return [position.minion, position.behind?.minion].filter(isDefined);
      })
      .with(BOARD_SLOT_ZONES.BACK_ROW, () => {
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
