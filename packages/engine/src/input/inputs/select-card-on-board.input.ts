import { assert } from '@game/shared';
import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { GAME_PHASES, type InteractionStateDict } from '../../game/game.enums';
import { CardNotFoundError } from '../../card/card-errors';

const schema = defaultInputSchema.extend({
  cardId: z.string()
});

export class SelectCardOnBoardInput extends Input<typeof schema> {
  readonly name = 'selectCardOnBoard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const card = this.game.cardSystem.getCardById(this.payload.cardId);
    assert(card, new CardNotFoundError());

    const interactionContext =
      this.game.interaction.getContext<
        InteractionStateDict['SELECTING_CARDS_ON_BOARD']
      >();
    await interactionContext.ctx.selectCard(this.player, card);
  }
}
