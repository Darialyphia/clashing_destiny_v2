import { isDestinyDeckCard } from '../../board/board.system';
import type { CardKind } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Player } from '../player.entity';

export type PlayedCard<T extends AnyCard = AnyCard> = {
  player: Player; // the player whose turn it was when the card was played
  card: T;
};

export class CardTrackerComponent {
  private cardsPlayedByGameTurn = new Map<number, PlayedCard[]>();

  constructor(
    private game: Game,
    private player: Player
  ) {
    game.on(GAME_EVENTS.CARD_AFTER_PLAY, event => {
      if (isDestinyDeckCard(event.data.card)) return;
      if (!event.data.card.player.equals(this.player)) return;

      const turn = game.turnSystem.elapsedTurns;
      if (!this.cardsPlayedByGameTurn.has(turn)) {
        this.cardsPlayedByGameTurn.set(turn, []);
      }
      this.cardsPlayedByGameTurn.get(turn)?.push({
        player: event.data.card.player,
        card: event.data.card
      });
    });
  }

  get cardsPlayedThisGameTurn() {
    return this.cardsPlayedByGameTurn.get(this.game.turnSystem.elapsedTurns) ?? [];
  }

  getCardsPlayedThisGameTurnOfKind<
    TKind extends CardKind,
    TCard extends AnyCard & { kind: TKind } = AnyCard & { kind: TKind }
  >(kind: TKind): Array<PlayedCard<TCard>> {
    return this.cardsPlayedThisGameTurn.filter(card => card.card.kind === kind) as Array<
      PlayedCard<TCard>
    >;
  }

  getCardsPlayedOnGameTurn(turn: number) {
    return this.cardsPlayedByGameTurn.get(turn) ?? [];
  }

  getCardsPlayedSince(turn: number) {
    const cards: PlayedCard[] = [];
    for (let i = turn; i <= this.game.turnSystem.elapsedTurns; i++) {
      const turnCards = this.cardsPlayedByGameTurn.get(i);
      if (turnCards) {
        cards.push(...turnCards);
      }
    }
    return cards;
  }
}
