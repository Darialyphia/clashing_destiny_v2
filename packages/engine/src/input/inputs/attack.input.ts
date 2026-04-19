import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { assert, isDefined } from '@game/shared';
import {
  IllegalAttackTargetError,
  NotCurrentPlayerError,
  UnitNotOwnedError,
  UnknownUnitError
} from '../input-errors';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  unitId: z.string(),
  position: z
    .object({
      x: z.number(),
      y: z.number()
    })
    .nullable()
});

export class AttackInput extends Input<typeof schema> {
  readonly name = 'attack';

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
    assert(this.unit.canAttackAt(this.payload.position), new IllegalAttackTargetError());

    await this.unit.attack(this.payload.position);
  }
}
