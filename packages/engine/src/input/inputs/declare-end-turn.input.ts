import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class DeclareEndTurnInput extends Input<typeof schema> {
  readonly name = 'declareEndTurn';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    await this.game.gamePhaseSystem.declareEndPhase();
  }
}
