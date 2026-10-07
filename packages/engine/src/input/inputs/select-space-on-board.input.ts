import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';
import { InvalidInteractionStateError } from '../input-errors';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class SelectSpaceOnBoardInput extends Input<typeof schema> {
  readonly name = 'selectSpaceOnBoard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
      new InvalidInteractionStateError()
    );
    const interactionContext =
      this.game.interaction.getContext<
        InteractionStateDict['SELECTING_SPACE_ON_BOARD']
      >();
    await interactionContext.ctx.selectSpace(this.player, this.payload.id);
  }
}
