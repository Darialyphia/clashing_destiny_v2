import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { assert } from '@game/shared';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { TooManyMulliganedCardsError } from '../input-errors';

const schema = defaultInputSchema.extend({
  indices: z.number().array()
});

export class MulliganInput extends Input<typeof schema> {
  readonly name = 'mulligan';

  readonly allowedPhases = [GAME_PHASES.MULLIGAN];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.payload.indices.length <= this.game.config.MAX_MULLIGANED_CARDS,
      new TooManyMulliganedCardsError()
    );

    const gamePhaseContext =
      this.game.gamePhaseSystem.getContext<GamePhasesDict['MULLIGAN']>();

    await gamePhaseContext.ctx.commitMulliganforPlayer(this.player, this.payload.indices);
  }
}
