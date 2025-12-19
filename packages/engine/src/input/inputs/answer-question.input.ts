import { GAME_PHASES } from '../../game/game.enums';
import type { InteractionStateDict } from '../../game/systems/game-interaction.system';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class AnswerQuestionInput extends Input<typeof schema> {
  readonly name = 'answerQuestion';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['ASK_QUESTION']>();

    interactionContext.ctx.commit(this.player, this.payload.id);
  }
}
