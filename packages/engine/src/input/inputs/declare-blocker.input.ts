import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalBlockError,
  IllegalCombatStepError,
  IllegalTargetError
} from '../input-errors';
import { COMBAT_STEP_TRANSITIONS } from '../../game/phases/combat.phase';

const schema = defaultInputSchema.extend({
  blockerId: z.string().nullable()
});

export class DeclareBlockerInput extends Input<typeof schema> {
  readonly name = 'declareBlocker';

  readonly allowedPhases = [GAME_PHASES.ATTACK];

  protected payloadSchema = schema;

  get blocker() {
    return this.player.enemyMinions.find(
      creature => creature.id === this.payload.blockerId
    );
  }

  async impl() {
    assert(!this.player.isTurnPlayer, new IllegalTargetError());

    const { ctx } = this.game.gamePhaseSystem.getContext<GamePhasesDict['ATTACK']>();

    assert(
      ctx.can(COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED),
      new IllegalCombatStepError()
    );
    assert(this.blocker, new IllegalBlockError());
    assert(ctx.canBlock(this.blocker), new IllegalBlockError());

    await ctx.declareBlocker(this.blocker);
  }
}
