import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CancelInteractionInput extends Input<typeof schema> {
  readonly name = 'cancelInteraction';

  readonly allowedPhases = [
    GAME_PHASES.PLAY_CARD,
    GAME_PHASES.MAIN,
    GAME_PHASES.LEVEL_UP
  ];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext = this.game.interaction.getContext();

    await interactionContext.ctx.cancel(this.player);
  }
}
