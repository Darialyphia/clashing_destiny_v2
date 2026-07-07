import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';
import type { SerializedInput } from '../input/input-system';
import { INTERACTION_STATES } from '../game/game.enums';
import { SpellCard } from '../card/entities/spell.entity';
import { ArtifactCard } from '../card/entities/artifact.entity';
import type { MinionCard } from '../card/entities/minion.entity';

export type AIMove = {
  input: SerializedInput;
  score: number;
};

export class AISystem {
  constructor(
    private game: Game,
    private playerId: string,
    private nextActionCallback: (action: SerializedInput) => void
  ) {}

  get player() {
    return this.game.playerSystem.getPlayerById(this.playerId)!;
  }

  get isActive() {
    return this.game.activePlayer.id === this.playerId;
  }

  initialize() {
    this.game.on(GAME_EVENTS.NEW_SNAPSHOT, async () => {
      if (!this.isActive) return;
      const possibleMoves = this.collectPossibleMoves();
      const bestMove = possibleMoves.sort((a, b) => b.score - a.score)[0];
      await this.game.dispatch(bestMove.input);
    });
  }

  onUpdate(input: SerializedInput) {
    void this.game.dispatch(input);
  }

  private collectPossibleMoves() {
    const moves: AIMove[] = [];
    const interactionCtx = this.game.interaction.getContext();
    match(interactionCtx)
      .with({ state: INTERACTION_STATES.IDLE }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.ASK_QUESTION }, ctx => {
        const choices = ctx.ctx.getChoices();
        const [bestChoice] = choices.sort(
          (a, b) =>
            b.aiHints.shouldPick(this.game, this.player, a.id) -
            a.aiHints.shouldPick(this.game, this.player, b.id)
        );
        moves.push({
          input: {
            type: 'answerQuestion',
            payload: {
              playerId: this.playerId,
              id: bestChoice.id
            }
          },
          score: 100
        });
      })
      .with({ state: INTERACTION_STATES.CHOOSING_CARDS }, ctx => {
        const choices = ctx.ctx.getChoices();
        const cardsToChoose = Math.min(ctx.ctx.maxChoiceCount, choices.length);
        const sortedChoices = choices.sort(
          (a, b) =>
            b.aiHints.shouldPick(this.game, this.player) -
            a.aiHints.shouldPick(this.game, this.player)
        );
        const selectedCards = sortedChoices.slice(0, cardsToChoose);
        moves.push({
          input: {
            type: 'chooseCards',
            payload: {
              playerId: this.playerId,
              indices: selectedCards.map(card => choices.indexOf(card))
            }
          },
          score: 100
        });
      })
      .with({ state: INTERACTION_STATES.REARRANGING_CARDS }, ctx => {
        moves.push({
          input: {
            type: 'commitRearrangeCards',
            payload: {
              playerId: this.playerId,
              buckets: ctx.ctx.buckets.map(bucket => ({
                id: bucket.id,
                cards: bucket.cards.map(c => c.id)
              }))
            }
          },
          score: 100
        });
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS_ON_BOARD }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.USING_ABILITY }, ctx => {
        // moves.push({
        //   input: {
        //     type: 'commitUseAbility',
        //     payload: {
        //       playerId: this.playerId,
        //       manaCostIndices: this.player.cardManager.hand
        //         .filter(card => card.canBeUsedAsManaCost)
        //         .sort(
        //           (a, b) =>
        //             b.blueprint.aiHints.shouldUseAsMainDeckCardManacost(
        //               this.game,
        //               b as any
        //             ) -
        //             a.blueprint.aiHints.shouldUseAsMainDeckCardManacost(
        //               this.game,
        //               a as any
        //             )
        //         )
        //         .slice(0, ctx.ctx.ability.manaCost)
        //         .map(card => this.player.cardManager.hand.indexOf(card))
        //     }
        //   },
        //   score: 100
        // });
      })
      .with({ state: INTERACTION_STATES.SELECTING_MINION_SLOT }, ctx => {
        // TODO
      })
      .exhaustive();

    return moves;
  }
}
