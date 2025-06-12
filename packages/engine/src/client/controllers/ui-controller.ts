import type { Override } from '@game/shared';
import { GAME_PHASES } from '../../game/game.enums';
import type { MinionPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import { DeclareAttackTargetCardAction } from '../actions/declare-attack-target';
import { SelectCardAction } from '../actions/select-card';
import { SelectCardOnBoardAction } from '../actions/select-card-on-board';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { PlayerViewModel } from '../view-models/player.model';
import type { GameClientState } from './state-controller';
import { SelectMinionslotAction } from '../actions/select-minion-slot';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedBoardMinionSlot } from '../../board/board-minion-slot.entity';

export type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export type UiMinionslot = Override<MinionPosition, { player: PlayerViewModel }>;
export type MinionSlotClickRule = {
  predicate: (slot: UiMinionslot, state: GameClientState) => boolean;
  handler: (slot: UiMinionslot) => void;
};

export class UiController {
  private _hoveredCard: CardViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _isManaCostOverlayOpened = false;

  private _isDestinyPhaseOverlayOpened = false;

  private _isChooseCardsInteractionOverlayOpened = false;

  private _isChooseAffinityInteractionOverlayOpened = false;

  private cardClickRules: CardClickRule[] = [];

  private minionSlotClickRules: MinionSlotClickRule[] = [];

  private hoverTimeout: NodeJS.Timeout | null = null;

  selectedManaCostIndices: number[] = [];

  constructor(private client: GameClient) {
    this.buildClickRules();
    this.buildMinionSlotClickRules();
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

  get isDestinyPhaseOverlayOpened() {
    return this._isDestinyPhaseOverlayOpened;
  }

  get isChooseCardsInteractionOverlayOpened() {
    return this._isChooseCardsInteractionOverlayOpened;
  }

  get isChooseAffinityInteractionOverlayOpened() {
    return this._isChooseAffinityInteractionOverlayOpened;
  }

  private buildClickRules() {
    this.cardClickRules = [
      new SelectCardAction(this.client),
      new DeclareAttackTargetCardAction(this.client),
      new SelectCardOnBoardAction(this.client)
    ];
  }

  private buildMinionSlotClickRules() {
    this.minionSlotClickRules = [new SelectMinionslotAction(this.client)];
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

  onMinionSlotClick(slot: UiMinionslot) {
    const state = this.client.state;

    for (const rule of this.minionSlotClickRules) {
      if (rule.predicate(slot, state)) {
        rule.handler(slot);
        return;
      }
    }
  }

  get isInteractingPlayer() {
    return this.client.state.effectChain
      ? this.client.playerId === this.client.state.effectChain.player
      : this.client.playerId === this.client.state.interaction.ctx.player;
  }

  get isInteractivePlayer() {
    return this.client.playerId === this.client.getActivePlayerId();
  }

  update() {
    this._isChooseCardsInteractionOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_CARDS;

    this._isChooseAffinityInteractionOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_AFFINITY;

    this._isManaCostOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.interaction.state === INTERACTION_STATES.PLAYING_CARD;

    this._isDestinyPhaseOverlayOpened =
      this.isInteractingPlayer &&
      this.client.state.phase.state === GAME_PHASES.DESTINY &&
      this.client.state.interaction.state === INTERACTION_STATES.IDLE;

    if (this.client.state.interaction.state !== INTERACTION_STATES.PLAYING_CARD) {
      this.selectedManaCostIndices = [];
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

  getHandDOMSelector(playerId: string) {
    return `#hand-${playerId}`;
  }

  getBoardDOMSelector() {
    return '#board';
  }

  getEffectChainDOMSelector() {
    return '#effect-chain';
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

  getMinionSlotDomSelector(
    slot: Pick<SerializedBoardMinionSlot, 'playerId' | 'position' | 'zone'>
  ) {
    return `#minion-slot-${slot.playerId}-${slot.position}-${slot.zone}`;
  }
}
