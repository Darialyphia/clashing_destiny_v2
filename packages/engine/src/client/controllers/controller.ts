import type { MinionPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import type { CardViewModel } from '../view-models/card.model';

export type GameClientController = {
  onCardClick: (card: CardViewModel) => void;
  onMinionSlotClck: (slot: MinionPosition) => void;
  getCardActions: (card: CardViewModel) => string[];
};
