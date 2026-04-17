import { GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import type { UnitViewModel } from '../view-models/unit.model';
import type { BoardCellViewModel } from '../view-models/board-cell.model';
import { MoveUnitAction } from '../actions/move-unit';
import { SelectSpaceOnBoardAction } from '../actions/select-space-on-board';
import { SelectUnitAction } from '../actions/select-unit';
import { UnselectUnitAction } from '../actions/unselect-unit';
import { AttackAction } from '../actions/attack';
import { PassGlobalAction } from '../actions/pass';

export type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export type BoardCellClickRule = {
  predicate: (tile: BoardCellViewModel, state: GameClientState) => boolean;
  handler: (tile: BoardCellViewModel) => void;
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
    private readonly selectorPrefix: string = ''
  ) {}

  get selector() {
    return `${this.selectorPrefix} #${this.id}`;
  }

  get element() {
    return document.querySelector(this.selector) as HTMLElement | null;
  }
}

export class UiController {
  private _hoveredCell: BoardCellViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _selectedUnit: UnitViewModel | null = null;

  isHandExpanded = false;

  draggedCard: CardViewModel | null = null;

  isPassConfirmationModalOpened = false;

  shouldBypassConfirmation = false;

  isOpponentHandExpanded = false;

  isReplacingCard = false;

  private cardClickRules: CardClickRule[] = [];

  private globalActionRules: GlobalActionRule[] = [];

  private boardCellClickRules: BoardCellClickRule[] = [];

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  optimisticState: UiOptimisticState = {
    playedCardId: null,
    isCancellingPlayCard: false
  };

  DOMSelectors = {
    cell: (x: number, y: number) => new DOMSelector(`cell-${x}-${y}`),
    board: new DOMSelector('board'),
    viewport: new DOMSelector('viewport'),
    effectChain: new DOMSelector('effect-chain'),
    playedCardZone: new DOMSelector('played-card'),
    cardInPlayedCardZone: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.playedCardZone.selector),
    heroHealthIndicator: (playerId: string) =>
      new DOMSelector(`hero-health-indicator-${playerId}`),
    hand: (playerId: string) => new DOMSelector(`hand-${playerId}`),
    unit: (unitId: string) =>
      new DOMSelector(`unit-${unitId}`, this.DOMSelectors.board.selector),
    cardOnBoard: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.board.selector),
    cardInHand: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.hand(playerId).selector),
    draggedCard: (id: string) => new DOMSelector(id, '#dragged-card'),
    hero: (playerId: string) => new DOMSelector(`${playerId}-hero-sprite`),
    cardAction: (cardId: string, actionId: string) =>
      new DOMSelector(`${cardId}-action-${actionId}`),
    actionButton: (actionId: string) => new DOMSelector(`action-button-${actionId}`),
    globalActionButtons: new DOMSelector('global-action-buttons'),
    mana: (playerId: string) => new DOMSelector(`mana-${playerId}`),
    playerInfos: (playerId: string) => new DOMSelector(`player-infos-${playerId}`)
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
    this.buildBoardCellClickRules();
    this.buildGlobalActionRules();
  }

  get hoveredCell() {
    return this._hoveredCell;
  }

  get selectedCard() {
    return this._selectedCard;
  }

  get selectedUnit() {
    return this._selectedUnit;
  }

  get playedCardId() {
    if (this.client.state.phase.state !== GAME_PHASES.PLAYING_CARD) return null;
    if (this.client.playerId !== this.client.state.interaction.ctx.player) return null;

    return this.client.state.phase.ctx.card;
  }

  private buildCardClickRules() {
    this.cardClickRules = [];
  }

  private buildBoardCellClickRules() {
    this.boardCellClickRules = [
      new MoveUnitAction(this.client),
      new AttackAction(this.client),
      new SelectSpaceOnBoardAction(this.client),
      new SelectUnitAction(this.client),
      new UnselectUnitAction(this.client)
    ];
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [new PassGlobalAction(this.client)];
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

    this.unselectCard();
  }

  onBoardCellClick(cell: BoardCellViewModel) {
    const state = this.client.state;
    for (const rule of this.boardCellClickRules) {
      if (rule.predicate(cell, state)) {
        rule.handler(cell);
        return;
      }
    }
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
    this.clearOptimisticState();
    if (this.selectedUnit?.isExhausted) {
      this.unselectUnit();
    }
  }

  hover(cell: BoardCellViewModel) {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    this.hoverTimeout = setTimeout(() => {
      this._hoveredCell = cell;
    }, 0);
  }

  unhover() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
    this._hoveredCell = null;
  }

  selectCard(card: CardViewModel) {
    this._selectedCard = card;
    this._selectedUnit = null;
  }

  unselectCard() {
    this._selectedCard = null;
  }

  selectUnit(unit: UnitViewModel) {
    this._selectedUnit = unit;
  }

  unselectUnit() {
    this._selectedUnit = null;
  }

  get explainerMessage() {
    const activePlayerId = this.client.getActivePlayerId();
    const state = this.client.state;

    if (activePlayerId !== this.client.playerId) {
      return 'Waiting for opponent...';
    }

    if (state.interaction.state === INTERACTION_STATES.SELECTING_SPACE_ON_BOARD) {
      return state.interaction.ctx.label;
    }

    return '';
  }
}
