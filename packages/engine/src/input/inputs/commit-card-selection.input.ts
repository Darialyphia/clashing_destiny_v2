import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CommitCardSelectionInput extends Input<typeof schema> {
  readonly name = 'commitCardSelection';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  impl() {
    const interactionContext =
      this.game.interaction.getContext<
        InteractionStateDict['SELECTING_CARDS_ON_BOARD']
      >();

    interactionContext.ctx.commit(this.player);
  }
}
