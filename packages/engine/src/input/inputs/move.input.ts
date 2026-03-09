import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError } from '../input-errors';
import { z } from 'zod';
import { CardNotFoundError } from '../../card/card-errors';
import { isMinion } from '../../card/card-utils';

const schema = defaultInputSchema.extend({
  cardId: z.string()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get minion() {
    const card = this.game.cardSystem.getCardById(this.payload.cardId);
    assert(card, new CardNotFoundError());
    assert(isMinion(card), new CardNotFoundError());
    return card;
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.minion.canMoveManually, new Error('Minion cannot be moved manually'));
    await this.minion.move();
  }
}
