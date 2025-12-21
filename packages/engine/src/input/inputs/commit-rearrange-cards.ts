import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';
import { z } from 'zod';

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

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['REARRANGING_CARDS']>();
    await interactionContext.ctx.commit(this.player, this.payload.buckets);
  }
}
