import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';
import type { SerializedInput } from '../input/input-system';

export type AIMove = {
  input: SerializedInput;
  getScore(game: Game): number;
};

export class AISystem {
  constructor(
    private game: Game,
    private playerId: string
  ) {}

  get player() {
    return this.game.playerSystem.getPlayerById(this.playerId)!;
  }

  get isActive() {
    if (this.game.effectChainSystem.currentChain) {
      return this.game.effectChainSystem.currentChain.isCurrentPlayer(this.player);
    }

    return this.game.interaction.getContext().ctx.player;
  }

  start() {
    this.game.on(GAME_EVENTS.INPUT_REQUIRED, async () => {
      if (!this.isActive) return;
      const possibleMoves = this.collectPossibleMoves();

      const bestMove = possibleMoves.sort(
        (a, b) => b.getScore(this.game) - a.getScore(this.game)
      )[0];
      if (bestMove) {
        await this.game.dispatch(bestMove.input);
      } else {
        // await this.game.dispatch({
        //   type: this.game.effectChainSystem.currentChain ? 'passChain' : 'declareEndTurn',
        //   payload: {
        //     playerId: this.player.id
        //   }
        // });
      }
    });
  }

  private collectPossibleMoves() {
    const moves: AIMove[] = [];
    // TODO
    return moves;
  }
}
