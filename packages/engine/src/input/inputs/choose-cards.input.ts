import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  indices: z.array(z.number())
});

export class ChooseCardsInput extends Input<typeof schema> {
  readonly name = 'chooseCards';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAYING_CARD];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_CARDS']>();

    interactionContext.ctx.commit(this.player, this.payload.indices);
  }
}
