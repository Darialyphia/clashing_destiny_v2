import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class SupplyCardInput extends Input<typeof schema> {
  readonly name = 'supplyCard';

  readonly allowedPhases = [GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());

    const phaseCtx = this.game.gamePhaseSystem.getContext<'play_card_phase'>();

    await phaseCtx.ctx.supply();
  }
}
