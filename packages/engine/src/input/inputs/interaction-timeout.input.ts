import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { defaultInputSchema, Input } from '../input';
import { match } from 'ts-pattern';

const schema = defaultInputSchema;

export class InteractionTimeoutInput extends Input<typeof schema> {
  readonly name = 'interactionTimeout';

  readonly allowedPhases = [GAME_PHASES.MAIN, GAME_PHASES.ATTACK, GAME_PHASES.END];

  protected payloadSchema = schema;

  async impl() {
    const interactionCtx = this.game.interaction.getContext();
    await match(interactionCtx)
      .with({ state: INTERACTION_STATES.IDLE }, async () => {
        if (this.game.effectChainSystem.currentChain) {
          await this.game.effectChainSystem.pass(this.player);
        } else {
          await this.game.turnSystem.pass(this.player);
        }
      })
      .with({ state: INTERACTION_STATES.ASK_QUESTION }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.CHOOSING_CARDS }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.CHOOSING_CHAIN_EFFECT }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.PLAYING_CARD }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.REARRANGING_CARDS }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS_ON_BOARD }, async ctx => {
        await ctx.ctx.commit(this.player, true);
      })
      .with({ state: INTERACTION_STATES.USING_ABILITY }, async ctx => {
        await ctx.ctx.commit(this.player, null);
      })
      .exhaustive();
  }
}
