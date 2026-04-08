import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  type: z.literal('draw')
});
export class CommitResourceActionInput extends Input<typeof schema> {
  readonly name = 'commitResourceAction';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    await this.player.performResourceAction({
      type: this.payload.type
    } as any);
  }
}
