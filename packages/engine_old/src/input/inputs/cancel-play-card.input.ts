import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CancelPlayCardInput extends Input<typeof schema> {
  readonly name = 'cancelPlayCard';

  readonly allowedPhases = [GAME_PHASES.PLAYING_CARD, GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const phaseContext = this.game.gamePhaseSystem.getContext<'playing_card_phase'>();

    await phaseContext.ctx.cancel?.(this.player);
    await this.game.interaction.getContext().ctx.cancel?.(this.player);
  }
}
