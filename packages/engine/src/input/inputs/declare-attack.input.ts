import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { COMBAT_STEPS, GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalAttackerError,
  NotCurrentPlayerError,
  UnknownSpaceError,
  UnknownUnitError
} from '../input-errors';
import { CorruptedGamephaseContextError } from '../../game/game-error';

const schema = defaultInputSchema.extend({
  attackerId: z.string(),
  spaceId: z.string()
});

export class DeclareAttackInput extends Input<typeof schema> {
  readonly name = 'declareAttack';

  readonly allowedPhases = [GAME_PHASES.MAIN];

  protected payloadSchema = schema;

  get attacker() {
    return this.player.minions.find(creature => creature.id === this.payload.attackerId);
  }

  get space() {
    return this.game.boardSystem.getSpaceById(this.payload.spaceId);
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.attacker, new UnknownUnitError(this.payload.attackerId));
    assert(this.space, new UnknownSpaceError(this.payload.spaceId));
    assert(this.attacker.canAttackAt(this.space), new IllegalAttackerError());

    assert(
      this.game.combatSystem.state === COMBAT_STEPS.DECLARE_ATTACKER,
      new CorruptedGamephaseContextError()
    );

    await this.game.combatSystem.declareAttacker(this.attacker);
    await this.game.combatSystem.declareAttackTarget(this.space);
  }
}
