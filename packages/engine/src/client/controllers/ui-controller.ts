import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import { CommitCardSelectionGlobalAction } from '../actions/commit-card-selection';
import { PassGlobalAction } from '../actions/pass';
import type { AbilityViewModel } from '../view-models/ability.model';
import { GAME_EVENTS, type SerializedStarEvent } from '../../game/game.events';
import type { BoardSpaceViewModel } from '../view-models/board-space.model';
import { SelectSpaceOnBoardAction } from '../actions/select-space-on-board';
import { MoveAction } from '../actions/move';

export type BoardCellClickRule = {
  predicate: (tile: BoardSpaceViewModel, state: GameClientState) => boolean;
  handler: (tile: BoardSpaceViewModel) => void;
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
  isCancellingPlayCard: boolean;
};

export class DOMSelector {
  constructor(
    readonly id: string,
    private readonly selectorPrefix: string = '',
    private readonly selectorSuffix: string = ''
  ) {}

  get selector() {
    return `${this.selectorPrefix} #${this.id} ${this.selectorSuffix}`;
  }

  get element() {
    return document.querySelector(this.selector) as HTMLElement | null;
  }

  get elements() {
    return document.querySelectorAll(this.selector) as NodeListOf<HTMLElement>;
  }
}

export class UiController {
  private _hoveredCard: CardViewModel | null = null;

  private _hoveredCardInHand: CardViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _draggedCard: CardViewModel | null = null;

  isHandExpanded = false;

  isPassConfirmationModalOpened = false;

  shouldBypassConfirmation = false;

  isOpponentHandExpanded = false;

  private boardSpaceClickRules: BoardCellClickRule[] = [];

  private globalActionRules: GlobalActionRule[] = [];

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  private onResetCallbacks: Array<() => void> = [];

  optimisticState: UiOptimisticState = {
    playedCardId: null,
    isCancellingPlayCard: false
  };

  DOMSelectors = {
    board: new DOMSelector('board'),
    effectChain: new DOMSelector('effect-chain'),
    playedCardZone: new DOMSelector('played-card'),
    heroHealthIndicator: (playerId: string) =>
      new DOMSelector(`hero-health-indicator-${playerId}`),
    hand: (playerId: string) => new DOMSelector(`hand-${playerId}`),
    draggedCard: (id: string) => new DOMSelector(id, '#dragged-card'),
    minionPosition: (playerId: string, minionId: string) =>
      new DOMSelector(`${playerId}-minion-position-${minionId}`),
    minionOnBoard: (playerId: string, minionId: string) =>
      new DOMSelector(
        minionId,
        this.DOMSelectors.minionPosition(playerId, minionId).selector
      ),
    discardPile: (playerId: string) => new DOMSelector(`discard-pile-${playerId}`),
    banishPile: (playerId: string) => new DOMSelector(`banish-pile-${playerId}`),
    destinyDeck: (playerId: string) => new DOMSelector(`destiny-deck-${playerId}`),
    boardSpace: (spaceId: string) => new DOMSelector(`board-space-${spaceId}`),
    cardOnBoard: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.board.selector),
    cardInHand: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.hand(playerId).selector),
    cardInEffectChain: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.effectChain.selector),
    cardInPlayedCardZone: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.playedCardZone.selector),
    hero: (playerId: string) => new DOMSelector(`${playerId}-hero-sprite`),
    cardAction: (cardId: string, actionId: string) =>
      new DOMSelector(`${cardId}-action-${actionId}`),
    anyCardOnPlayCardZone: new DOMSelector('played-card', '', '.card'),
    minionZone: (playerId: string) => new DOMSelector(`${playerId}-minion-zone`),
    actionButton: (actionId: string) => new DOMSelector(`action-button-${actionId}`),
    globalActionButtons: new DOMSelector('global-action-buttons')
  };

  displayedElements = {
    hand: true,
    playerInfos: true,
    artifacts: true,
    unlockedDestinyCards: true,
    destinyZone: true,
    actionButtons: true,
    destinyPhaseModal: true,
    phaseTracker: true,
    attackZone: true,
    defenseZone: true
  };

  highlightedElement: HTMLElement | null = null;

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {
    this.buildCardClickRules();
    this.buildGlobalActionRules();
  }

  private buildCardClickRules() {
    this.boardSpaceClickRules = [
      new SelectSpaceOnBoardAction(this.client),
      new MoveAction(this.client)
    ];
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [
      new CommitCardSelectionGlobalAction(this.client),
      new PassGlobalAction(this.client)
    ];
  }

  reset(cancelPlay = true) {
    let actionTaken = false;

    if (this.draggedCard) {
      this._draggedCard = null;
      actionTaken = true;
    }

    const canCancelInteraction = this.client.state.interaction.ctx.canCancel;
    if (cancelPlay && canCancelInteraction) {
      this.client.cancelInteraction();
      actionTaken = true;
    }

    this.onResetCallbacks.forEach(cb => cb());

    if (this.selectedCard) {
      this.unselect();
      actionTaken = true;
    }

    return actionTaken;
  }

  onReset(cb: () => void) {
    this.onResetCallbacks.push(cb);

    return () => {
      this.onResetCallbacks = this.onResetCallbacks.filter(c => c !== cb);
    };
  }

  get hoveredCard() {
    return this._hoveredCard;
  }

  get selectedCard() {
    return this._selectedCard;
  }

  get hoveredCardInHand() {
    return this._hoveredCardInHand;
  }

  get draggedCard() {
    return this._draggedCard;
  }

  playDraggedCard() {
    if (!this._draggedCard) return;
    this._draggedCard.play();
    this._draggedCard = null;
  }

  get playedCardId() {
    if (this.client.state.phase.state !== GAME_PHASES.PLAY_CARD) return null;
    if (this.client.playerId !== this.client.state.phase.ctx.player) return null;

    return this.client.state.phase.ctx.card;
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

  hoverCardInHand(card: CardViewModel) {
    this._hoveredCardInHand = card;
  }

  unhoverCardInHand() {
    this._hoveredCardInHand = null;
  }

  startDraggingCard(card: CardViewModel) {
    this._draggedCard = card;
  }

  stopDraggingCard() {
    this._draggedCard = null;
  }

  async onBoardSpaceClick(cell: BoardSpaceViewModel) {
    const state = this.client.state;
    for (const rule of this.boardSpaceClickRules) {
      if (rule.predicate(cell, state)) {
        rule.handler(cell);
        return;
      }
    }
    this.unselect();
    if (!this._draggedCard) return;
    this._draggedCard = null;
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
    this.clearOptimisticState();

    if (this.selectedCard?.isExhausted) {
      this.unselect();
    }
  }

  async onEvent(event: SerializedStarEvent) {
    if (event.eventName === GAME_EVENTS.INTERACTION_AFTER_CHANGE_STATE) {
      if (event.event.to.state === INTERACTION_STATES.IDLE) {
        this.reset(false);
      }
    }

    if (event.eventName === GAME_EVENTS.BEFORE_RESOLVE_COMBAT) {
      this.reset(false);
    }

    if (event.eventName === GAME_EVENTS.ABILITY_AFTER_USE) {
      this.reset(false);
    }

    if (event.eventName === GAME_EVENTS.AFTER_DECLARE_ATTACK_TARGET) {
      this.reset(false);
    }
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

  getPlayedCardZoneDOMSelector() {
    return `#played-card`;
  }

  getDestinyZoneDOMSelector(playerId: string) {
    return `#destiny-zone-${playerId}`;
  }

  getCardDOMSelector(cardId: string) {
    return `#${cardId}`;
  }

  getCardDOMSelectorInPLayedCardZone(cardId: string) {
    return `${this.getPlayedCardZoneDOMSelector()} ${this.getCardDOMSelector(cardId)}`;
  }

  getCardDOMSelectorInDestinyZone(cardId: string, playerId: string) {
    return `${this.getDestinyZoneDOMSelector(playerId)} ${this.getCardDOMSelector(cardId)}`;
  }

  get explainerMessage() {
    const activePlayerId = this.client.getActivePlayerId();
    const state = this.client.state;

    if (activePlayerId !== this.client.playerId) {
      return 'Waiting for opponent...';
    }

    if (
      state.phase.state === GAME_PHASES.PLAY_CARD &&
      state.phase.ctx.player === this.client.playerId
    ) {
      const card = state.entities[state.phase.ctx.card] as CardViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${card?.manaCost})`;
    }

    if (
      state.interaction.state === INTERACTION_STATES.USING_ABILITY &&
      state.interaction.ctx.player === this.client.playerId
    ) {
      const ability = state.entities[state.interaction.ctx.ability] as AbilityViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${ability?.manaCost})`;
    }

    if (state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD) {
      return state.interaction.ctx.label;
    }

    return 'Your turn: play a card, use an ability or declare an attack';
  }
}
