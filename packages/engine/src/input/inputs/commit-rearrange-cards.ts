import { defaultInputSchema, Input } from '../input';
import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';
import { z } from 'zod';
import { InvalidInteractionStateError } from '../input-errors';
import { assert } from '@game/shared';

const schema = defaultInputSchema.extend({
  buckets: z.array(
    z.object({
      id: z.string(),
      cards: z.array(z.string())
    })
  )
});

export class CommitRearrangeCardsInput extends Input<typeof schema> {
  readonly name = 'commitRearrangeCards';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.REARRANGING_CARDS,
      new InvalidInteractionStateError()
    );
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['REARRANGING_CARDS']>();
    await interactionContext.ctx.commit(this.player, this.payload.buckets);
  }
}
