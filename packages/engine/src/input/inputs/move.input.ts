import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import {
  CannotMoveManuallyError,
  IllegalMovementError,
  NotCurrentPlayerError
} from '../input-errors';
import { z } from 'zod';
import { CardNotFoundError, SpaceNotFoundError } from '../../card/card-errors';
import { isMinion } from '../../card/card-utils';

const schema = defaultInputSchema.extend({
  cardId: z.string(),
  spaceId: z.string()
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

  get space() {
    const space = this.game.boardSystem.getSpaceById(this.payload.spaceId);
    assert(space, new SpaceNotFoundError());
    return space;
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.minion.canMoveManually, new CannotMoveManuallyError());
    assert(
      this.minion.position.canMoveTo(this.space),
      new IllegalMovementError(this.space)
    );
    await this.minion.moveManually(this.space);
  }
}
