import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalBlockerError,
  NotCurrentPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  blockerId: z.string()
});

export class DeclareBlockerInput extends Input<typeof schema> {
  readonly name = 'declareBlocker';

  readonly allowedPhases = [GAME_PHASES.ATTACK];

  protected payloadSchema = schema;

  get blocker() {
    return this.player.minions.find(creature => creature.id === this.payload.blockerId);
  }

  get attacker() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK || !phaseCtx.ctx.attacker) {
      return null;
    }
    return phaseCtx.ctx.attacker;
  }

  get attackTarget() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) {
      return null;
    }
    return phaseCtx.ctx.target;
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.blocker, new UnknownUnitError(this.payload.blockerId));
    if (!this.attacker || !this.attackTarget) {
      throw new IllegalBlockerError();
    }
    assert(
      this.blocker.canBlock(this.attacker, this.attackTarget),
      new IllegalBlockerError()
    );

    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) {
      throw new IllegalBlockerError();
    }
    await phaseCtx.ctx.declareBlocker(this.blocker);
  }
}
