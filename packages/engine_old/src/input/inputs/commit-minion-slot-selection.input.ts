import { defaultInputSchema, Input } from '../input';
import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';

import { InvalidInteractionStateError } from '../input-errors';
import { assert } from '@game/shared';

const schema = defaultInputSchema;

export class CommitMinionSlotSelectionInput extends Input<typeof schema> {
  readonly name = 'commitMinionSlotSelection';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAYING_CARD];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.SELECTING_MINION_SLOT,
      new InvalidInteractionStateError()
    );
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['SELECTING_MINION_SLOT']>();

    interactionContext.ctx.commit(this.player);
  }
}
