import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError } from '../input-errors';
import { CorruptedGamephaseContextError } from '../../game/game-error';

const schema = defaultInputSchema;

export class PassInput extends Input<typeof schema> {
  readonly name = 'pass';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.COMBAT];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    assert(
      phaseCtx.state === GAME_PHASES.MAIN || phaseCtx.state === GAME_PHASES.COMBAT,
      new CorruptedGamephaseContextError()
    );
    await phaseCtx.ctx.pass(this.player);
  }
}
