import { assert } from '@game/shared';
import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { InvalidInteractionStateError } from '../input-errors';

const schema = defaultInputSchema.extend({
  indices: z.array(z.number())
});

export class ChooseCardsInput extends Input<typeof schema> {
  readonly name = 'chooseCards';

  readonly allowedPhases = [
    GAME_PHASES.DRAW,
    GAME_PHASES.SUPPLY,
    GAME_PHASES.MAIN,
    GAME_PHASES.PLAY_CARD
  ];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.CHOOSING_CARDS,
      new InvalidInteractionStateError()
    );

    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_CARDS']>();

    await interactionContext.ctx.commit(this.player, this.payload.indices);
  }
}
