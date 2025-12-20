import { COMBAT_STEPS, GAME_PHASES, INTERACTION_STATES } from '../../game/game.enums';
import { DeclareAttackTargetCardAction } from '../actions/declare-attack-target';
import { SelectCardAction } from '../actions/select-card';
import { SelectCardOnBoardAction } from '../actions/select-card-on-board';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';
import { ToggleForManaCost } from '../actions/toggle-for-mana-cost';
import { CancelPlayCardGlobalAction } from '../actions/cancel-play-card';
import { CommitCardSelectionGlobalAction } from '../actions/commit-card-selection';
import { PassGlobalAction } from '../actions/pass';
import type { AbilityViewModel } from '../view-models/ability.model';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from '../../board/board.constants';
import { EFFECT_CHAIN_STATES } from '../../game/effect-chain';
import { match } from 'ts-pattern';

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
  private _hoveredCard: CardViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _draggedCard: CardViewModel | null = null;

  private _bufferedPlayedZone: BoardSlotZone | null = null;

  isHandExpanded = false;

  isPassConfirmationModalOpened = false;

  shouldBypassConfirmation = false;

  isOpponentHandExpanded = false;

  private cardClickRules: CardClickRule[] = [];

  private globalActionRules: GlobalActionRule[] = [];

  private hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  optimisticState: UiOptimisticState = {
    playedCardId: null
  };

  DOMSelectors = {
    board: new DOMSelector('board'),
    effectChain: new DOMSelector('effect-chain'),
    playedCardZone: new DOMSelector('played-card'),
    heroHealthIndicator: (playerId: string) =>
      new DOMSelector(`hero-health-indicator-${playerId}`),
    hand: (playerId: string) => new DOMSelector(`hand-${playerId}`),
    destinyZone: (playerId: string) => new DOMSelector(`destiny-zone-${playerId}`),
    minionPosition: (playerId: string, zone: BoardSlotZone, slot: number) =>
      new DOMSelector(`${playerId}-${zone}-minion-position-${slot}`),
    minionOnBoard: (
      playerId: string,
      zone: BoardSlotZone,
      slot: number,
      minionId: string
    ) =>
      new DOMSelector(
        minionId,
        this.DOMSelectors.minionPosition(playerId, zone, slot).selector
      ),
    discardPile: (playerId: string) => new DOMSelector(`discard-pile-${playerId}`),
    banishPile: (playerId: string) => new DOMSelector(`banish-pile-${playerId}`),
    destinyDeck: (playerId: string) => new DOMSelector(`destiny-deck-${playerId}`),
    cardOnBoard: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.board.selector),
    cardInHand: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.hand(playerId).selector),
    cardInEffectChain: (cardId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.effectChain.selector),
    cardInDestinyZone: (cardId: string, playerId: string) =>
      new DOMSelector(cardId, this.DOMSelectors.destinyZone(playerId).selector),
    hero: (playerId: string) => new DOMSelector(`${playerId}-hero-sprite`),
    cardAction: (cardId: string, actionId: string) =>
      new DOMSelector(`${cardId}-action-${actionId}`),
    zone: (playerId: string, zone: BoardSlotZone) =>
      match(zone)
        .with(BOARD_SLOT_ZONES.ATTACK_ZONE, () => this.DOMSelectors.attackZone(playerId))
        .with(BOARD_SLOT_ZONES.DEFENSE_ZONE, () =>
          this.DOMSelectors.defenseZone(playerId)
        )
        .exhaustive(),
    attackZone: (playerId: string) => new DOMSelector(`${playerId}-attack-zone`),
    defenseZone: (playerId: string) => new DOMSelector(`${playerId}-defense-zone`),
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

  get hoveredCard() {
    return this._hoveredCard;
  }

  get selectedCard() {
    return this._selectedCard;
  }

  get draggedCard() {
    return this._draggedCard;
  }

  get bufferedPlayedZone() {
    return this._bufferedPlayedZone;
  }

  clearBufferedPlayedZone() {
    this._bufferedPlayedZone = null;
  }

  playDraggedCard(zone?: BoardSlotZone) {
    if (!this._draggedCard) return;
    if (zone) {
      this._bufferedPlayedZone = zone;
    }
    this._draggedCard.play();
    this._draggedCard = null;
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
      new DeclareAttackTargetCardAction(this.client),
      new SelectCardOnBoardAction(this.client)
    ];
  }

  private buildGlobalActionRules() {
    this.globalActionRules = [
      new CancelPlayCardGlobalAction(this.client),
      new CommitCardSelectionGlobalAction(this.client),
      new PassGlobalAction(this.client)
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

  startDraggingCard(card: CardViewModel) {
    this._draggedCard = card;
  }

  stopDraggingCard() {
    this._draggedCard = null;
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

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  clearOptimisticState() {
    this.optimisticState.playedCardId = null;
  }

  update() {
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
      state.interaction.state === INTERACTION_STATES.PLAYING_CARD &&
      state.interaction.ctx.player === this.client.playerId
    ) {
      const card = state.entities[state.interaction.ctx.card] as CardViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${card?.manaCost})`;
    }

    if (
      state.interaction.state === INTERACTION_STATES.USING_ABILITY &&
      state.interaction.ctx.player === this.client.playerId
    ) {
      const ability = state.entities[state.interaction.ctx.ability] as AbilityViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${ability?.manaCost})`;
    }

    if (
      state.interaction.state === INTERACTION_STATES.USING_ABILITY &&
      state.interaction.ctx.player === this.client.playerId
    ) {
      const ability = state.entities[state.interaction.ctx.ability] as AbilityViewModel;
      return `Put cards in the Destiny Zone (${this.selectedManaCostIndices.length} / ${ability?.manaCost})`;
    }

    if (state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD) {
      return 'Select targets';
    }

    if (this.client.state.effectChain) {
      if (this.client.state.effectChain.state === EFFECT_CHAIN_STATES.RESOLVING) {
        return 'Resolving effect chain...';
      }
      return this.client.state.effectChain.player === this.client.playerId
        ? 'Effect chain: Your turn'
        : 'Effect chain: Opponent turn';
    }

    if (state.phase.state === GAME_PHASES.ATTACK) {
      if (state.phase.ctx.step === COMBAT_STEPS.DECLARE_TARGET) {
        return 'Declare attack target';
      }
    }

    return 'Your turn: play a card, use an ability or declare an attack';
  }
}
