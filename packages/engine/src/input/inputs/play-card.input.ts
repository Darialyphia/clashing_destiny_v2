import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number(),
  manaCostIndices: z.array(z.number())
});

export class PlayCardInput extends Input<typeof schema> {
  readonly name = 'playCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    const card = this.player.cardManager.getCardInHandAt(this.payload.index);
    assert(card.canPlay(), new IllegalCardPlayedError());

    await this.player.playMainDeckCardAtIndex(
      this.payload.index,
      this.payload.manaCostIndices
    );
  }
}
