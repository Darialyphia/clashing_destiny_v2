import { GAME_PHASES } from '../../game/game.enums';
import { INTERACTION_STATES } from '../../game/systems/game-interaction.system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '../../game/systems/game-snapshot.system';
import type { GameClient, NetworkAdapter } from '../client';
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

  private buildClickRules() {
    this.cardClickRules = [];
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
