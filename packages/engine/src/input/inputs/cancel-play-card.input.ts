import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { type InteractionStateDict } from '../../game/systems/game-interaction.system';

const schema = defaultInputSchema;

export class CancelPlayCardInput extends Input<typeof schema> {
  readonly name = 'cancelPlayCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['PLAYING_CARD']>();

    await interactionContext.ctx.cancel(this.player);
  }
}
