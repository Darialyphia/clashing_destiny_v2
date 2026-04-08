import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError } from '../input-errors';
import { IllegalGameStateError } from '../../game/game-error';

const schema = defaultInputSchema;

export class PassInput extends Input<typeof schema> {
  readonly name = 'pass';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(
      this.player.canPass,
      new IllegalGameStateError('Player cannot pass at this time')
    );

    await this.player.pass();
  }
}
