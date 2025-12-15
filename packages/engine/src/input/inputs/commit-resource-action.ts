import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { z } from 'zod';
import type { Rune } from '../../card/card.enums';
import { assert } from '@game/shared';
import { IllegalResourceActionError } from '../input-errors';

const schema = defaultInputSchema.extend({
  type: z.enum(['gain_rune', 'draw_card']),
  rune: z.string().optional()
});

export class CommitResourceActionInput extends Input<typeof schema> {
  readonly name = 'commitResourceAction';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.player.resourceActionPerformedThisTurn < this.player.maxResourceActionPerTurn,
      new IllegalResourceActionError()
    );
    await this.player.performResourceAction({
      type: this.payload.type,
      rune: this.payload.rune! as Rune
    });
  }
}
