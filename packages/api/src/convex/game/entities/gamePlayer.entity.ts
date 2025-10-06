import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';

export type GamePlayerDoc = Doc<'gamePlayers'>;
export type GamePlayerId = Id<'gamePlayers'>;

export class GamePlayer extends Entity<
  Id<'gamePlayers'>,
  GamePlayerDoc & { username: string }
> {
  get userId() {
    return this.data.userId;
  }

  get deckId() {
    return this.data.deckId;
  }

  get gameId() {
    return this.data.gameId;
  }
}
