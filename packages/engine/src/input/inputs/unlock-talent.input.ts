import { z } from 'zod';
import { defaultInputSchema, Input } from '../input';
import { GAME_PHASES, type GamePhase } from '../../game/game.enums';
import { assert, type BetterExtract } from '@game/shared';
import { IllegalTalentUnlockError, UnknownTalentError } from '../input-errors';

const schema = defaultInputSchema.extend({
  id: z.string().nullable()
});

export class UnlockTalentInput extends Input<typeof schema> {
  readonly name = 'unlockTalent';

  readonly allowedPhases = [GAME_PHASES.DESTINY];

  protected payloadSchema = schema;

  async impl() {
    if (!this.payload.id) {
      await this.game.gamePhaseSystem
        .getContext<BetterExtract<GamePhase, 'destiny_phase'>>()
        .ctx.skipDestinyPhase();
      return;
    }

    const talent = this.player.hero.talentTree.getNode(this.payload.id);
    assert(talent, new UnknownTalentError(this.payload.id));
    assert(talent.canUnlock, new IllegalTalentUnlockError());

    await this.game.gamePhaseSystem
      .getContext<BetterExtract<GamePhase, 'destiny_phase'>>()
      .ctx.unlockTalent(this.payload.id);
  }
}
