import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { type InteractionStateDict } from '../../game/systems/game-interaction.system';
import { GAME_PHASES } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  zone: z.enum(['attack', 'defense']),
  slot: z.number()
});

export class SelectMinionSlotInput extends Input<typeof schema> {
  readonly name = 'selectMinionSlot';

  readonly allowedPhases = [
    GAME_PHASES.DESTINY,
    GAME_PHASES.MAIN,
    GAME_PHASES.ATTACK,
    GAME_PHASES.END
  ];

  protected payloadSchema = schema;

  async impl() {
    const interactionContext =
      this.game.interaction.getContext<InteractionStateDict['SELECTING_MINION_SLOT']>();
    await interactionContext.ctx.selectPosition(this.player, {
      zone: this.payload.zone,
      slot: this.payload.slot
    });
  }
}
