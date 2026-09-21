import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema;

export class CancelPlayingCardInput extends Input<typeof schema> {
  readonly name = 'cancelPlayingCard';

  readonly allowedPhases = [GAME_PHASES.PLAY_CARD];

  protected payloadSchema = schema;

  async impl() {
    const phaseCtx = this.game.gamePhaseSystem.getContext<'play_card_phase'>();

    if (!phaseCtx.ctx.isPlayingCard) {
      await phaseCtx.ctx.cancel(this.player);
    }
  }
}
