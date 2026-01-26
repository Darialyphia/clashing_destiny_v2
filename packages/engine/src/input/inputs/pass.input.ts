import { assert, isDefined } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema;

export class PassInput extends Input<typeof schema> {
  readonly name = 'pass';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    console.log(
      'Executing PassInput for player',
      this.player.id,
      'with chain ?',
      isDefined(this.game.effectChainSystem.currentChain)
    );
    if (this.game.effectChainSystem.currentChain) {
      assert(
        this.game.effectChainSystem.currentChain.currentPlayer.equals(this.player),
        new NotCurrentPlayerError()
      );
      await this.game.effectChainSystem.pass(this.player);
      console.log('Passed effect chain for player', this.player.id);
    } else {
      assert(this.player.isInteractive, new NotCurrentPlayerError());
      await this.game.turnSystem.pass(this.player);
      console.log('Passed turn for player', this.player.id);
    }
  }
}
