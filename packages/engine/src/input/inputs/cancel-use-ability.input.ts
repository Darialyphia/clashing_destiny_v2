import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CancelUseAbilityInput extends Input<typeof schema> {
  readonly name = 'cancelUseAbility';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['USING_ABILITY']>();

    await interactionContext.ctx.cancel(this.player);
  }
}
