import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardClickRule } from '../controllers/ui-controller';
import type { CardViewModel } from '../view-models/card.model';

export class ToggleForManaCost implements CardClickRule {
  constructor(private client: GameClient) {}

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      card.location === 'hand' &&
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
      this.client.playerId === state.interaction.ctx.player
    );
  }

  async handler(card: CardViewModel) {
    const index = card
      .getPlayer()
      .getHand()
      .findIndex(c => c.equals(card));
    if (this.client.ui.selectedManaCostIndices.includes(index)) {
      this.client.ui.selectedManaCostIndices =
        this.client.ui.selectedManaCostIndices.filter(i => i !== index);
      void this.client.fxAdapter.onUnselectCardForManaCost(card, this.client);
    } else {
      this.client.ui.selectedManaCostIndices.push(index);
      await this.client.fxAdapter.onSelectCardForManaCost(card, this.client);
      if (this.client.ui.selectedManaCostIndices.length === card.manaCost) {
        this.client.commitPlayCard();
      }
    }
  }
}
