import { isDefined } from '@game/shared';
import type { BoardMinionSlot } from '../board/board-minion-slot.entity';
import { MINION_SLOT_ZONES } from '../board/board;constants';
import type { HeroCard } from './entities/hero.entity';
import type { MinionCard } from './entities/minion.entity';
import { match } from 'ts-pattern';

export type AttackAOE = {
  getAffectedCards(position: BoardMinionSlot): Array<MinionCard | HeroCard>;
};

export class SingleTargetAOE implements AttackAOE {
  getAffectedCards(position: BoardMinionSlot) {
    return position.minion ? [position.minion] : [];
  }
}

export class CleaveAOE implements AttackAOE {
  getAffectedCards(position: BoardMinionSlot) {
    return [position.minion, position.left?.minion, position.right?.minion].filter(
      isDefined
    );
  }
}

export class ChargeAOE implements AttackAOE {
  getAffectedCards(position: BoardMinionSlot) {
    return match(position.zone)
      .with(MINION_SLOT_ZONES.FRONT_ROW, () => {
        return [position.minion, position.behind?.minion].filter(isDefined);
      })
      .with(MINION_SLOT_ZONES.BACK_ROW, () => {
        return [position.minion, position.inFront?.minion].filter(isDefined);
      })
      .exhaustive();
  }
}
