import type { NetworkAdapter } from '../client';
import type { CardViewModel } from '../view-models/card.model';
import type { GameClientState } from './state-controller';

type CardClickRule = {
  predicate: (card: CardViewModel, state: GameClientState) => boolean;
  handler: (card: CardViewModel) => void;
};

export class UiController {
  _hoveredCard: CardViewModel | null = null;
  _selectedCard: CardViewModel | null = null;

  private cardClickRules: CardClickRule[] = [];

  private hoverTimeout: NodeJS.Timeout | null = null;

  constructor(private networkAdapter: NetworkAdapter) {
    this.buildClickRules();
  }

  private buildClickRules() {
    this.cardClickRules = [];
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
