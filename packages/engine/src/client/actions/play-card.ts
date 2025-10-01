import { match } from 'ts-pattern';
import type { GameClient } from '../client';
import type { CardActionRule, CardViewModel } from '../view-models/card.model';
import { CARD_DECK_SOURCES } from '../../card/card.enums';

export class PlayCardAction implements CardActionRule {
  readonly id = 'play';

  constructor(private client: GameClient) {}

  predicate(card: CardViewModel) {
    return card.canPlay;
  }

  getLabel(card: CardViewModel) {
    return match(card.source)
      .with(CARD_DECK_SOURCES.MAIN_DECK, () => `@[mana] ${card.manaCost}@ Play`)
      .with(CARD_DECK_SOURCES.DESTINY_DECK, () => `@[destiny] ${card.destinyCost}@ Play`)
      .exhaustive();
  }

  handler(card: CardViewModel) {
    this.client.ui.optimisticState.playedCardId = card.id;

    this.client.dispatch({
      type: 'declarePlayCard',
      payload: {
        id: card.id,
        playerId: this.client.playerId
      }
    });

    void this.client.fxAdapter.onDeclarePlayCard(card, this.client);
  }
}
