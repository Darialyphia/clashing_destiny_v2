import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import { SelectCardAction } from '../actions/select-card';
import { SelectCardOnBoardAction } from '../actions/select-card-on-board';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import { ToggleForManaCost } from '../actions/toggle-for-mana-cost';
import { CancelPlayCardGlobalAction } from '../actions/cancel-play-card';
import { CommitCardSelectionGlobalAction } from '../actions/commit-card-selection';

export type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export type GlobalActionRule = {
  id: string;
  shouldDisplay: (state: GameClientState) => boolean;
  shouldBeDisabled: (state: GameClientState) => boolean;
  onClick: () => void;
  getLabel(state: GameClientState): string;
  variant: 'primary' | 'error' | 'info';
};

export type UiOptimisticState = {
  playedCardId: string | null;
};
export class UiController {
  private _hoveredCard: CardViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _isManaCostOverlayOpened = false;

  private _isChooseCardsInteractionOverlayOpened = false;

  private cardClickRules: CardClickRule[] = [];

  private globalActionRules: GlobalActionRule[] = [];

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  optimisticState: UiOptimisticState = {
    playedCardId: null
  };

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {
    this.buildCardClickRules();
    this.buildGlobalActionRules();
  }

  get hoveredCard() {
    return this._hoveredCard;
  }

  get selectedCard() {
    return this._selectedCard;
  }

  get isManaCostOverlayOpened() {
    return this._isManaCostOverlayOpened;
  }

  get isChooseCardsInteractionOverlayOpened() {
    return this._isChooseCardsInteractionOverlayOpened;
  }

  get playedCardId() {
    if (this.client.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD)
      return null;
    if (this.client.playerId !== this.client.state.interaction.ctx.player) return null;

    return this.client.state.interaction.ctx.card;
  }

  private buildCardClickRules() {
    this.cardClickRules = [
      new ToggleForManaCost(this.client),
      new SelectCardAction(this.client),
      new SelectCardOnBoardAction(this.client)
    ];
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [
      new CancelPlayCardGlobalAction(this.client),
      new CommitCardSelectionGlobalAction(this.client)
    ];
  }
  get globalActions() {
    return this.globalActionRules
      .filter(rule => rule.shouldDisplay(this.client.state))
      .map(rule => {
        return {
          id: rule.id,
          label: rule.getLabel(this.client.state),
          isDisabled: rule.shouldBeDisabled(this.client.state),
          variant: rule.variant,
          onClick: () => {
            rule.onClick();
          }
        };
      });
  }

  onCardClick(card: CardViewModel) {
    const state = this.client.state;
    for (const rule of this.cardClickRules) {
      if (rule.predicate(card, state)) {
        rule.handler(card);
        return;
      }
    }

    this.unselect();
  }

  get isInteractingPlayer() {
    return this.client.playerId === this.client.state.interaction.ctx.player;
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
    this._isChooseCardsInteractionOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_CARDS;

    this._isManaCostOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.PLAYING_CARD;

    if (this.client.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
      this.selectedManaCostIndices = [];
    }

    this.clearOptimisticState();
  }

  hover(card: CardViewModel) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.hoverTimeout = setTimeout(() => {
      this._hoveredCard = card;
    }, 200);
  }

  unhover() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this._hoveredCard = null;
  }

  select(card: CardViewModel) {
    this._selectedCard = card;
  }

  unselect() {
    this._selectedCard = null;
  }

  getHandDOMSelector(playerId: string) {
    return `#hand-${playerId}`;
  }

  getBoardDOMSelector() {
    return '#board';
  }

  getEffectChainDOMSelector() {
    return '#effect-chain';
  }

  getPlayedCardZoneDOMSelector() {
    return `#played-card`;
  }

  getDestinyZoneDOMSelector(playerId: string) {
    return `#destiny-zone-${playerId}`;
  }

  getCardDOMSelector(cardId: string) {
    return `#${cardId}`;
  }

  getCardDOMSelectorOnBoard(cardId: string) {
    return `${this.getBoardDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInHand(cardId: string, playerId: string) {
    return `${this.getHandDOMSelector(playerId)} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInEffectChain(cardId: string) {
    return `${this.getEffectChainDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInPLayedCardZone(cardId: string) {
    return `${this.getPlayedCardZoneDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInDestinyZone(cardId: string, playerId: string) {
    return `${this.getDestinyZoneDOMSelector(playerId)} ${this.getCardDOMSelector(cardId)}`;
  }

  get idleMessage() {
    return 'Waiting for opponent...';
  }

  get explainerMessage() {
    const activePlayerId = this.client.getActivePlayerId();
    const state = this.client.state;

    if (activePlayerId !== this.client.playerId) {
      return this.idleMessage;
    }

    if (
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
      state.interaction.ctx.player === this.client.playerId
    ) {
      const card = state.entities[state.interaction.ctx.card] as CardViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${card?.manaCost})`;
    }
    if (state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD) {
      return 'Select targets';
    }

    if (state.phase.state === GAME_PHASES.COMBAT) {
      return 'combat in progress';
    }

    return '';
  }
}
