import {
  INTERACTION_STATES,
  type InteractionState,
  type SerializedInteractionContext
} from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { GameClientState } from '../controllers/state-controller';
import type { CardClickRule } from '../controllers/ui-controller';
import type { AbilityViewModel } from '../view-models/ability.model';
import type { CardViewModel } from '../view-models/card.model';

export class ToggleForManaCost implements CardClickRule {
  constructor(private client: GameClient) {}

  isValidInteractionState(state: GameClientState): boolean {
    return (
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD ||
      state.interaction.state === INTERACTION_STATES.USING_ABILITY
    );
  }

  predicate(card: CardViewModel, state: GameClientState) {
    return (
      this.client.isActive() &&
      card.location === 'hand' &&
      this.isValidInteractionState(state) &&
      this.client.playerId === state.interaction.ctx.player &&
      card.canBeUsedAsManaCost
    );
  }

  async handler(card: CardViewModel) {
    const interaction = this.client.state.interaction;
    if (
      interaction.state !== INTERACTION_STATES.PLAYING_CARD &&
      interaction.state !== INTERACTION_STATES.USING_ABILITY
    ) {
      return;
    }

    const index = card.player.hand.findIndex(c => c.equals(card));
    if (this.client.ui.selectedManaCostIndices.includes(index)) {
      this.unselect(index, card);
    } else {
      await this.select(index, card, interaction);
    }
  }

  private async select(
    index: number,
    card: CardViewModel,
    interactionState: SerializedInteractionContext & {
      state: Extract<InteractionState, 'playing_card' | 'using_ability'>;
    }
  ) {
    this.client.ui.selectedManaCostIndices.push(index);
    await this.client.fxAdapter.onSelectCardForManaCost(card, this.client);
    if (interactionState.state === INTERACTION_STATES.PLAYING_CARD) {
      this.selectForPlayingCard(interactionState);
    } else if (interactionState.state === INTERACTION_STATES.USING_ABILITY) {
      this.selectForUsingAbility(interactionState);
    }
  }

  private selectForUsingAbility(
    interactionState: SerializedInteractionContext & {
      state: Extract<InteractionState, 'using_ability'>;
    }
  ) {
    const usedAbility = this.client.state.entities[
      interactionState.ctx.ability
    ] as AbilityViewModel;

    if (this.client.ui.selectedManaCostIndices.length === usedAbility.manaCost) {
      this.client.commitUseAbility();
      this.client.ui.isHandExpanded = false;
    }
  }

  private selectForPlayingCard(
    interactionState: SerializedInteractionContext & {
      state: Extract<InteractionState, 'playing_card'>;
    }
  ) {
    const playedCardId = interactionState.ctx.card;
    const playedCard = this.client.state.entities[playedCardId] as CardViewModel;

    if (this.client.ui.selectedManaCostIndices.length === playedCard.manaCost) {
      this.client.commitPlayCard();
      this.client.ui.isHandExpanded = false;
    }
  }

  private unselect(index: number, card: CardViewModel) {
    this.client.ui.selectedManaCostIndices =
      this.client.ui.selectedManaCostIndices.filter(i => i !== index);
    void this.client.fxAdapter.onUnselectCardForManaCost(card, this.client);
  }
}
