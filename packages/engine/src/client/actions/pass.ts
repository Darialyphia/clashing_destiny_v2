import { isDefined } from '@game/shared';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { GlobalActionRule } from '../controllers/ui-controller';
import { INTERACTION_STATES, GAME_PHASES } from '../../game/game.enums';
import type { PlayerViewModel } from '../view-models/player.model';
import type { CardViewModel } from '../view-models/card.model';

export class PassGlobalAction implements GlobalActionRule {
  readonly variant = 'error' as const;

  readonly id = 'pass';

  constructor(private client: GameClient) {}

  get hasRemainingAction() {
    const state = this.client.state;

    const player = state.entities[this.client.playerId] as PlayerViewModel;

    const hand = player.hand;
    const boardSide = state.board.sides.find(side => side.playerId === player.id)!;
    const destinyDeck = boardSide.destinyDeck.map(
      id => state.entities[id] as CardViewModel
    );
    const minions = boardSide.minions
      .filter(isDefined)
      .map(id => state.entities[id] as CardViewModel);

    return (
      hand.some(card => card.canPlay) ||
      destinyDeck.some(card => card.canPlay) ||
      minions.some(card => !card.isExhausted)
    );
  }

  getLabel(): string {
    return this.client.state.effectChain ? 'Pass Chain' : 'Pass Turn';
  }

  shouldDisplay(state: GameClientState): boolean {
    if (isDefined(state.effectChain)) {
      return (
        state.effectChain.player === this.client.playerId &&
        state.interaction.state === INTERACTION_STATES.IDLE
      );
    } else {
      return (
        state.phase.state === GAME_PHASES.MAIN &&
        state.interaction.state === INTERACTION_STATES.IDLE &&
        this.client.playerId === state.currentPlayer
      );
    }
  }

  shouldBeDisabled(): boolean {
    return false;
  }

  onClick(): void {
    const shouldConfirm = false;
    if (shouldConfirm) {
      this.client.ui.isPassConfirmationModalOpened = true;
    } else {
      this.client.pass();
    }
  }
}
