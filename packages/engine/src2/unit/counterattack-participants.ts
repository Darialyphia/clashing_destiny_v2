import type { Player } from '../player/player.entity';
import type { Unit } from './unit.entity';

export abstract class CounterAttackParticipantStrategy {
  abstract getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit | Player;
    affectedUnits: Unit[];
  }): Array<Unit | Player>;
}

export class SingleCounterAttackParticipantStrategy extends CounterAttackParticipantStrategy {
  getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit | Player;
    affectedUnits: Unit[];
  }): Array<Unit | Player> {
    return [opts.initialTarget];
  }
}

export class EveryCounterAttackParticipantStrategy extends CounterAttackParticipantStrategy {
  getCounterattackParticipants(opts: {
    attacker: Unit;
    initialTarget: Unit | Player;
    affectedUnits: Array<Unit | Player>;
  }): Array<Unit | Player> {
    return opts.affectedUnits;
  }
}
