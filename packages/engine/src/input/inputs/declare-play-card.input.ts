import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert, isDefined } from '@game/shared';
import { IllegalCardPlayedError } from '../input-errors';
import { CARD_DECK_SOURCES } from '../../card/card.enums';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class DeclarePlayCardInput extends Input<typeof schema> {
  readonly name = 'declarePlayCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const card = this.game.cardSystem.getCardById(this.payload.id);
    assert(isDefined(card), new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());
    assert(
      card.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK ||
        !card.player.hasPlayedDestinyCardThisTurn,
      new IllegalCardPlayedError()
    );

    await this.game.interaction.declarePlayCardIntent(card, this.player);
  }
}
