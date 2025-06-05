import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalAttackTargetError,
  NotTurnPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  targetId: z.string()
});

export class DeclareAttackTargetInput extends Input<typeof schema> {
  readonly name = 'declareAttackTarget';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get target() {
    return [this.player.opponent.hero, ...this.player.enemyMinions].find(
      creature => creature.id === this.payload.targetId
    );
  }

  async impl() {
    assert(this.player.isTurnPlayer, new NotTurnPlayerError());
    assert(this.target, new UnknownUnitError(this.payload.targetId));
    assert(this.target.canBeAttacked, new IllegalAttackTargetError());

    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['ATTACK']>()
      .ctx.declareAttackTarget(this.target);
  }
}
