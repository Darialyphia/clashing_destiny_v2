import { defaultInputSchema, Input } from '../input';
import {
  GAME_PHASES,
  INTERACTION_STATES,
  type InteractionStateDict
} from '../../game/game.enums';
import { assert } from '@game/shared';
import { InvalidInteractionStateError } from '../input-errors';

const schema = defaultInputSchema;

export class CommitCardSelectionInput extends Input<typeof schema> {
  readonly name = 'commitCardSelection';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
      new InvalidInteractionStateError()
    );

    const interactionContext =
      this.game.interaction.getContext<
        InteractionStateDict['SELECTING_CARDS_ON_BOARD']
      >();

    await interactionContext.ctx.commit(this.player);
  }
}
