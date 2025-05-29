import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalAttackerError,
  IllegalAttackTargetError,
  NotTurnPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  attackerId: z.string(),
  defenderId: z.string()
});

export class DeclareAttackInput extends Input<typeof schema> {
  readonly name = 'declareAttack';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get attacker() {
    const candidates = this.player.boardSide.getMinions('attack');

    return candidates.find(creature => creature.id === this.payload.attackerId);
  }

  get defender() {
    const candidates = [
      this.player.opponent.hero,
      ...this.player.opponent.boardSide.getAllMinions()
    ];

    return candidates.find(creature => creature.id === this.payload.defenderId);
  }

  async impl() {
    assert(this.player.isTurnPlayer, new NotTurnPlayerError());
    assert(this.attacker, new UnknownUnitError(this.payload.attackerId));
    assert(this.defender, new UnknownUnitError(this.payload.defenderId));
    assert(this.attacker.canAttack, new IllegalAttackerError());
    assert(this.defender.canBeAttacked, new IllegalAttackTargetError());

    await this.game.gamePhaseSystem.startCombat();
    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttacker({ attacker: this.attacker, target: this.defender });
  }
}
