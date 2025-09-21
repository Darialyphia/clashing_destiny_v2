import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotCurrentPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  id: z.string()
});

export class DeclarePlayDestinyCardInput extends Input<typeof schema> {
  readonly name = 'declarePlayDestinyCard';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());

    const card = this.player.cardManager.getDestinyCardById(this.payload.id);
    assert(card, new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());

    await this.game.gamePhaseSystem.currentPlayer.playDestinyCard(card);
  }
}
