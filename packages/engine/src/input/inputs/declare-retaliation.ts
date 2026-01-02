import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalCounterAttackError,
  NotCurrentPlayerError,
  WrongGamePhaseError
} from '../input-errors';

const schema = defaultInputSchema;

export class DeclareRetaliationInput extends Input<typeof schema> {
  readonly name = 'declareRetaliation';

  readonly allowedPhases = [GAME_PHASES.ATTACK];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(
      this.game.gamePhaseSystem.getState() === GAME_PHASES.ATTACK,
      new WrongGamePhaseError()
    );
    const phaseCtx = this.game.gamePhaseSystem.getContext<'attack_phase'>();
    await phaseCtx.ctx.declareRetaliation();
  }
}
