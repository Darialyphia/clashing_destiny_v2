import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert, isDefined } from '@game/shared';
import { IllegalCardPlayedError } from '../input-errors';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class PlayCardInput extends Input<typeof schema> {
  readonly name = 'playCard';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  async impl() {
    const card = this.player.cardManager.getCardInHandById(this.payload.id);
    assert(isDefined(card), new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());
    await this.game.gamePhaseSystem.playCard(this.payload.id, this.player);
  }
}
