import { GAME_PHASES } from '../../game/game.enums';
import type { InteractionStateDict } from '../../game/systems/game-interaction.system';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';

const schema = defaultInputSchema.extend({
  indices: z.array(z.number())
});

export class ChooseCardsInput extends Input<typeof schema> {
  readonly name = 'chooseCards';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['CHOOSING_CARDS']>();

    interactionContext.ctx.commit(this.player, this.payload.indices);
  }
}
