import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { InvalidInteractionStateError } from '../input-errors';
import { assert } from '@game/shared';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class AnswerQuestionInput extends Input<typeof schema> {
  readonly name = 'answerQuestion';

  readonly allowedPhases = [GAME_PHASES.DRAW, GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.ASK_QUESTION,
      new InvalidInteractionStateError()
    );
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['ASK_QUESTION']>();

    await interactionContext.ctx.commit(this.player, this.payload.id);
  }
}
