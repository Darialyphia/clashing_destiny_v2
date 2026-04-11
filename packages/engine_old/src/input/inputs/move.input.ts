import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { NotCurrentPlayerError } from '../input-errors';
import { z } from 'zod';
import { CardNotFoundError } from '../../card/card-errors';
import { isMinion } from '../../card/card-utils';
import { BOARD_SLOT_ROWS } from '../../board/board.constants';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  position: z.object({
    row: z.enum([BOARD_SLOT_ROWS.BACK_ROW, BOARD_SLOT_ROWS.FRONT_ROW]),
    slot: z.number()
  })
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
    await this.minion.moveManually({
      player: this.player,
      row: this.payload.position.row,
      slot: this.payload.position.slot
    });
  }
}
