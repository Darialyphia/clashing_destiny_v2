import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class ChooseChainEffectsInput extends Input<typeof schema> {
  readonly name = 'chooseChainEffects';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_CHAIN_EFFECT']>();

    interactionContext.ctx.commit(this.player, this.payload.id);
  }
}
