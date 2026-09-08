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
  id: z.string()
});

export class ChooseChainEffectsInput extends Input<typeof schema> {
  readonly name = 'chooseChainEffects';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  impl() {
    assert(
      this.game.interaction.getState() === INTERACTION_STATES.CHOOSING_CHAIN_EFFECT,
      new InvalidInteractionStateError()
    );
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_CHAIN_EFFECT']>();

    interactionContext.ctx.commit(this.player, this.payload.id);
  }
}
