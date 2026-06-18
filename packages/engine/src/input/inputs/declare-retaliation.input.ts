import { defaultInputSchema, Input } from '../input';
import { COMBAT_STEPS, GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { NotCurrentPlayerError, WrongGamePhaseError } from '../input-errors';

const schema = defaultInputSchema;

export class DeclareRetaliationInput extends Input<typeof schema> {
  readonly name = 'declareRetaliation';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(
      this.game.combatSystem.state === COMBAT_STEPS.REACTION,
      new WrongGamePhaseError()
    );
    await this.game.combatSystem.declareRetaliation();
  }
}
