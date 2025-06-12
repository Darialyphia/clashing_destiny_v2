import { isDestinyDeckCard } from '../../board/board.system';
import type { CardKind } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Player } from '../player.entity';

export class CardTrackerComponent {
  private cardsPlayedByTurn = new Map<number, AnyCard[]>();

  constructor(
    private game: Game,
    private player: Player
  ) {
    game.on(GAME_EVENTS.CARD_AFTER_PLAY, event => {
      if (isDestinyDeckCard(event.data.card)) return;
      if (!event.data.card.player.equals(this.player)) return;

      const turn = game.gamePhaseSystem.elapsedTurns;
      if (!this.cardsPlayedByTurn.has(turn)) {
        this.cardsPlayedByTurn.set(turn, []);
      }
      this.cardsPlayedByTurn.get(turn)?.push(event.data.card);
    });
  }

  get cardsPlayedThisTurn() {
    return this.cardsPlayedByTurn.get(this.game.gamePhaseSystem.elapsedTurns)!;
  }

  getCardsPlayedThisTurnOfKind<
    TKind extends CardKind,
    TCard extends AnyCard & { kind: TKind } = AnyCard & { kind: TKind }
  >(kind: TKind): TCard[] {
    return this.cardsPlayedThisTurn.filter(card => card.kind === kind) as TCard[];
  }

  getCardsPlayedSince(turn: number): AnyCard[] {
    const cards: AnyCard[] = [];
    for (let i = turn; i <= this.game.gamePhaseSystem.elapsedTurns; i++) {
      const turnCards = this.cardsPlayedByTurn.get(i);
      if (turnCards) {
        cards.push(...turnCards);
      }
    }
    return cards;
  }
}
