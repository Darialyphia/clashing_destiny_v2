import { INTERACTION_STATES } from '../../game/game.enums';
import type { GameClient } from '../client';
import { FX_EVENTS } from './fx-controller';

export type UiOptimisticState = {
  playedCardId: string | null;
  isCancellingPlayCard: boolean;
  chooseCardSelection: Record<string, number[]>;
};

export class OptimisticStateManager {
  private _state: UiOptimisticState = {
    playedCardId: null,
    isCancellingPlayCard: false,
    chooseCardSelection: {}
  };

  constructor(private client: GameClient) {
    client.fx.on(FX_EVENTS.INTERACTION_AFTER_CHANGE_STATE, event => {
      if (event.from === INTERACTION_STATES.CHOOSING_CARDS) {
        this.clearChooseCardSelection();
      }
    });
  }

  get state() {
    return this._state;
  }

  onUpdate() {
    this.finishPlayingCard();
  }

  startPlayingCard(cardId: string) {
    this._state.playedCardId = cardId;
    this._state.isCancellingPlayCard = false;
    this.client.triggerStateUpdate();
  }

  cancelPlayingCard() {
    this._state.playedCardId = null;
    this._state.isCancellingPlayCard = true;
    this.client.triggerStateUpdate();
  }

  resetCancellingPlayCard() {
    this._state.isCancellingPlayCard = false;
    this.client.triggerStateUpdate();
  }

  finishPlayingCard() {
    this._state.playedCardId = null;
    this._state.isCancellingPlayCard = false;
    this.client.triggerStateUpdate();
  }

  chooseCards(playerId: string, cardIndices: number[]) {
    this._state.chooseCardSelection[playerId] = cardIndices;
    this.client.triggerStateUpdate();
  }

  clearChooseCardSelection() {
    this._state.chooseCardSelection = {};
    this.client.triggerStateUpdate();
  }
}
