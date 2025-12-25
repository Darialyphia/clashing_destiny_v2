import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { z } from 'zod';
import { assert } from '@game/shared';
import { IllegalResourceActionError } from '../input-errors';

const schema = defaultInputSchema.extend({
  type: z.enum(['put_card_in_shard_zone', 'put_card_in_mana_zone']),
  cardId: z.string()
});

export class CommitResourceActionInput extends Input<typeof schema> {
  readonly name = 'commitResourceAction';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.player.canPerformResourceActionOfType(this.payload.type),
      new IllegalResourceActionError()
    );
    await this.player.performResourceAction({
      type: this.payload.type,
      cardId: this.payload.cardId
    });
  }
}
