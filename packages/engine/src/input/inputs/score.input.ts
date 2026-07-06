import { assert } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import {
  CannotScoreError,
  NotCurrentPlayerError,
  UnknownUnitError,
  UnitNotOwnedError
} from '../input-errors';
import { z } from 'zod';
import { isMinion } from '../../card/card-utils';
import { CardNotFoundError } from '../../card/card-errors';

const schema = defaultInputSchema.extend({
  minionId: z.string()
});

export class ScoreInput extends Input<typeof schema> {
  readonly name = 'score';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get minion() {
    const card = this.game.cardSystem.getCardById(this.payload.minionId);
    assert(card, new UnknownUnitError(this.payload.minionId));
    assert(isMinion(card), new CardNotFoundError());
    return card;
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    const minion = this.minion;
    assert(minion.player.equals(this.player), new UnitNotOwnedError());
    assert(minion.canScore, new CannotScoreError());
    await minion.score();
  }
}
