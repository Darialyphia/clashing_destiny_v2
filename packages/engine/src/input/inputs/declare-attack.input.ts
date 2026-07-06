import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { COMBAT_STEPS, GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  AlreadyInCombatError,
  IllegalAttackerError,
  IllegalAttackTargetError,
  NotCurrentPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  attackerId: z.string(),
  targetId: z.string()
});

export class DeclareAttackInput extends Input<typeof schema> {
  readonly name = 'declareAttack';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get attacker() {
    return this.player.minions.find(creature => creature.id === this.payload.attackerId);
  }

  get target() {
    return [...this.player.enemyMinions].find(
      creature => creature.id === this.payload.targetId
    );
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.attacker, new UnknownUnitError(this.payload.attackerId));
    assert(this.attacker.canAttack, new IllegalAttackerError());
    assert(this.target, new UnknownUnitError(this.payload.targetId));
    assert(this.target.canBeAttacked, new IllegalAttackTargetError());
    assert(
      this.game.combatSystem.state === COMBAT_STEPS.DECLARE_ATTACKER,
      new AlreadyInCombatError()
    );

    await this.game.combatSystem.declareAttacker(this.attacker);
    await this.game.combatSystem.declareAttackTarget(this.target);
  }
}
