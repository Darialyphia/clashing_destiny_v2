import { assert } from '@game/shared';
import { z } from 'zod';
import { GAME_PHASES } from '../../game/game.enums';
import { RUNES } from '../../player/player.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError, InputError } from '../input-errors';

const schema = defaultInputSchema.extend({
  action: z.discriminatedUnion('type', [
    z.object({ type: z.literal('rune'), rune: z.nativeEnum(RUNES) }),
    z.object({ type: z.literal('draw') })
  ])
});

export class TakeResourceActionInput extends Input<typeof schema> {
  readonly name = 'takeResourceAction';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(
      this.player.canTakeResourceAction(),
      new InputError('Player cannot take any more resource actions this turn.')
    );
    await this.player.takeResourceAction(this.payload.action);
  }
}
