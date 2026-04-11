import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import {
  UnknownUnitError,
  UnitNotOwnedError,
  IllegalMovementError,
  NotCurrentPlayerError
} from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  x: z.number(),
  y: z.number()
});

export class MoveInput extends Input<typeof schema> {
  readonly name = 'move';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  private get unit() {
    return this.game.unitSystem.getUnitById(this.payload.unitId);
  }

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(isDefined(this.unit), new UnknownUnitError(this.payload.unitId));
    assert(
      this.unit.player.equals(this.game.turnSystem.initiativePlayer),
      new UnitNotOwnedError()
    );
    assert(this.unit.canMoveTo(this.payload), new IllegalMovementError(this.payload));

    await this.unit.move(this.payload);
  }
}
