import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { assert } from '@game/shared';

const schema = defaultInputSchema;

export class CancelSpaceSelectionInput extends Input<typeof schema> {
  readonly name = 'cancelSpaceSelection';

  readonly allowedPhases = [GAME_PHASES.PLAYING_CARD, GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext = this.game.interaction.getContext();
    assert(
      interactionContext.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
      new Error('Cannot cancel space selection when not selecting space on board')
    );

    await interactionContext.ctx.cancel(this.player);
  }
}
