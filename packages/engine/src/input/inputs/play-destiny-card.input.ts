import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';
import { assert } from '@game/shared';
import { IllegalCardPlayedError, NotTurnPlayerError } from '../input-errors';

const schema = defaultInputSchema.extend({
  index: z.number().nullable()
});

export class PlayDestinyCardInput extends Input<typeof schema> {
  readonly name = 'playDestinyCard';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  async impl() {
    assert(
      this.game.gamePhaseSystem.turnPlayer.equals(this.player),
      new NotTurnPlayerError()
    );

    if (this.payload.index === null) {
      await this.game.gamePhaseSystem
        .getContext<GamePhasesDict['DESTINY']>()
        .ctx.skipDestinyPhase();
      return;
    }

    const card = this.player.cardManager.getDestinyCardAt(this.payload.index);
    assert(card, new IllegalCardPlayedError());

    await this.game.gamePhaseSystem
      .getContext<GamePhasesDict['DESTINY']>()
      .ctx.playDestinyCard(this.payload.index);
  }
}
