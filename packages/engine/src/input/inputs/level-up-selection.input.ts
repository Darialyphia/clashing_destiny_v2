import { defaultInputSchema, Input } from '../input';
import { z } from 'zod';
import { GAME_PHASES, type GamePhasesDict } from '../../game/game.enums';

const schema = defaultInputSchema.extend({
  cardId: z.string().nullable()
});

export class LevelUpSelectionInput extends Input<typeof schema> {
  readonly name = 'levelUpSelection';

  readonly allowedPhases = [GAME_PHASES.LEVEL_UP];

  protected payloadSchema = schema;

  async impl() {
    const gamePhaseContext =
      this.game.gamePhaseSystem.getContext<GamePhasesDict['LEVEL_UP']>();

    await gamePhaseContext.ctx.selectDestinyCardForPlayer(
      this.player,
      this.payload.cardId
    );
  }
}
