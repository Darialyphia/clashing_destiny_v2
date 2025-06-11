import { isDestinyDeckCard } from '../../board/board.system';
import type { CardKind } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Player } from '../player.entity';

export class CardTrackerComponent {
  private _cardsPlayedThisTurn: AnyCard[] = [];

  private _cardsPlayedSinceStartOfLastOwnTurn: AnyCard[] = [];

  constructor(
    private game: Game,
    private player: Player
  ) {
    game.on(GAME_EVENTS.PLAYER_START_TURN, event => {
      this._cardsPlayedThisTurn = [];
      if (event.data.player.equals(this.player)) {
        this._cardsPlayedSinceStartOfLastOwnTurn = [];
      }
    });

    game.on(GAME_EVENTS.CARD_AFTER_PLAY, event => {
      if (isDestinyDeckCard(event.data.card)) return;
      if (!event.data.card.player.equals(this.player)) return;

      this._cardsPlayedThisTurn.push(event.data.card);
      this._cardsPlayedSinceStartOfLastOwnTurn.push(event.data.card);
    });
  }

  get cardsPlayedThisTurn() {
    return this._cardsPlayedThisTurn;
  }

  getCardsPlayedThisTurnOfKind<
    TKind extends CardKind,
    TCard extends AnyCard & { kind: TKind } = AnyCard & { kind: TKind }
  >(kind: TKind): TCard[] {
    return this._cardsPlayedThisTurn.filter(card => card.kind === kind) as TCard[];
  }

  get cardsPlayedSinceStartOfLastOwnTurn() {
    return this._cardsPlayedSinceStartOfLastOwnTurn;
  }
}
