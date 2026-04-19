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
import { Player } from '../../player/player.entity';

const schema = defaultInputSchema.extend({
  unitId: z.string().nullable(),
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

  private get attacker() {
    if (!isDefined(this.payload.unitId)) {
      return this.game.playerSystem.getPlayerById(this.payload.playerId);
    }
    return this.game.unitSystem.getUnitById(this.payload.unitId);
  }

  async impl() {
    assert(this.player.isCurrentPlayer, new NotCurrentPlayerError());
    assert(isDefined(this.attacker), new UnknownUnitError(this.payload.unitId ?? ''));
    assert(
      this.attacker instanceof Player
        ? this.attacker.equals(this.player)
        : this.attacker.player.equals(this.game.turnSystem.initiativePlayer),
      new UnitNotOwnedError()
    );
    assert(
      this.attacker.canAttackAt(this.payload.position),
      new IllegalAttackTargetError()
    );

    await this.attacker.attack(this.payload.position);
  }
}
