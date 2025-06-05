import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type { GameClient } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';

type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export class UiController {
  private _hoveredCard: CardViewModel | null = null;

  private _selectedCard: CardViewModel | null = null;

  private _isManaCostOverlayOpened = false;

  private _isDestinyPhaseOverlayOpened = false;

  private _isChooseCardsInteractionOverlayOpened = false;

  private _isChooseAffinityInteractionOverlayOpened = false;

  private _isSelectingAttackTarget = false;

  private cardClickRules: CardClickRule[] = [];

  private hoverTimeout: NodeJS.Timeout | null = null;

  constructor(private client: GameClient) {
    this.buildClickRules();
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

  get isSelectingAttackTarget() {
    return this._isSelectingAttackTarget;
  }

  startDeclaringAttack() {
    this._isSelectingAttackTarget = true;
  }

  private buildClickRules() {
    this.cardClickRules = [
      {
        predicate: (card, state) =>
          card.getPlayer().id === this.client.playerId &&
          state.interaction.state === INTERACTION_STATES.IDLE &&
          !this.selectedCard?.equals(card) &&
          this.isInteractingPlayer,
        handler: card => {
          this.select(card);
        }
      },
      {
        predicate: card =>
          this.isSelectingAttackTarget &&
          card.getPlayer().id !== this.client.playerId &&
          this.isInteractingPlayer,
        handler: card => {
          this.client.adapter.dispatch({
            type: 'declareAttack',
            payload: {
              attackerId: this.selectedCard!.id,
              defenderId: card.id,
              playerId: this.client.playerId
            }
          });
        }
      },
      {
        predicate: (card, state) =>
          state.interaction.state === INTERACTION_STATES.SELECTING_CARDS_ON_BOARD &&
          this.isInteractingPlayer,
        handler: card => {
          this.client.adapter.dispatch({
            type: 'selectCardOnBoard',
            payload: {
              cardId: card.id,
              playerId: this.client.playerId
            }
          });
        }
      }
    ];
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

  get isTurnPlayer() {
    return this.client.playerId === this.client.state.turnPlayer;
  }

  update() {
    if (this.isInteractingPlayer) {
      this._isChooseCardsInteractionOverlayOpened =
        this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_CARDS;

      this._isChooseAffinityInteractionOverlayOpened =
        this.client.state.interaction.state === INTERACTION_STATES.CHOOSING_AFFINITY;

      this._isManaCostOverlayOpened =
        this.client.state.interaction.state === INTERACTION_STATES.PLAYING_CARD;
    }

    if (this.isTurnPlayer) {
      this._isDestinyPhaseOverlayOpened =
        this.client.state.phase.state === GAME_PHASES.DESTINY;
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
}
