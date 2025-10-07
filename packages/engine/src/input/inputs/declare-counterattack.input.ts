import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES } from '../../game/game.enums';
import { assert } from '@game/shared';
import {
  IllegalCounterAttackError,
  NotCurrentPlayerError,
  UnknownUnitError
} from '../input-errors';

const schema = defaultInputSchema.extend({
  defenderId: z.string()
});

export class DeclareCounterAttackInput extends Input<typeof schema> {
  readonly name = 'declareCounterAttack';

  readonly allowedPhases = [GAME_PHASES.ATTACK];

  protected payloadSchema = schema;

  get defender() {
    if (this.player.hero.id === this.payload.defenderId) {
      return this.player.hero;
    }
    return this.player.minions.find(creature => creature.id === this.payload.defenderId);
  }

  async impl() {
    assert(this.player.isInteractive, new NotCurrentPlayerError());
    assert(this.defender, new UnknownUnitError(this.payload.defenderId));
    assert(this.defender.canCounterattack, new IllegalCounterAttackError());

    await this.defender.counterattack();
  }
}
