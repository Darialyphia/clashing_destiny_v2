import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';

const schema = defaultInputSchema;

export class SurrenderInput extends Input<typeof schema> {
  readonly name = 'surrender';

  readonly allowedPhases = [GAME_PHASES.DRAW, GAME_PHASES.PLAY_CARD, GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    await this.game.gamePhaseSystem.declareWinner([this.player.opponent!]);
  }
}
