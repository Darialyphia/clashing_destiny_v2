import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { match } from 'ts-pattern';

const schema = defaultInputSchema;

export class InteractionTimeoutInput extends Input<typeof schema> {
  readonly name = 'interactionTimeout';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.COMBAT, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionCtx = this.game.interaction.getContext();
    await match(interactionCtx)
      .with({ state: INTERACTION_STATES.IDLE }, async () => {
        const phaseCtx = this.game.gamePhaseSystem.getContext();
        if (
          phaseCtx?.state === GAME_PHASES.COMBAT ||
          phaseCtx?.state === GAME_PHASES.MAIN
        ) {
          await phaseCtx.ctx.pass(this.player);
        }
      })
      .with({ state: INTERACTION_STATES.ASK_QUESTION }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.CHOOSING_CARDS }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.PLAYING_CARD }, async ctx => {
        await ctx.ctx.commit(this.player);
      })
      .with({ state: INTERACTION_STATES.REARRANGING_CARDS }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS_ON_BOARD }, async ctx => {
        await ctx.ctx.commit(this.player, true);
      })
      .with({ state: INTERACTION_STATES.USING_ABILITY }, async ctx => {
        await ctx.ctx.commit(this.player);
      })
      .exhaustive();
  }
}
