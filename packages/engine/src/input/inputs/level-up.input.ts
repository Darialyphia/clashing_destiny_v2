import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { CannotLevelUpError, NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class LevelUpInput extends Input<typeof schema> {
  readonly name = 'levelUp';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.hasInitiative, new NotCurrentPlayerError());
    assert(this.player.canLevelUp, new CannotLevelUpError());
    await this.player.levelUp();
  }
}
