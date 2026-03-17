import { match } from 'ts-pattern';
import type { Game } from '../game/game';
import { GAME_EVENTS } from '../game/game.events';
import type { SerializedInput } from '../input/input-system';
import { INTERACTION_STATES } from '../game/game.enums';

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
        // TODO
      })
      .with({ state: INTERACTION_STATES.CHOOSING_CARDS }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.PLAYING_CARD }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.REARRANGING_CARDS }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.SELECTING_CARDS_ON_BOARD }, ctx => {
        // TODO
      })
      .with({ state: INTERACTION_STATES.USING_ABILITY }, ctx => {
        // TODO
      })
      .exhaustive();

    return moves;
  }
}
