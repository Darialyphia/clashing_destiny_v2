import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class AnswerQuestionInput extends Input<typeof schema> {
  readonly name = 'answerQuestion';

  readonly allowedPhases = [GAME_PHASES.DRAW, GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['ASK_QUESTION']>();

    await interactionContext.ctx.commit(this.player, this.payload.id);
  }
}
