import type { Doc, Id } from '../../_generated/dataModel';
import { Entity } from '../../shared/entity';
import { GamePlayer } from './gamePlayer.entity';

export type GameData = {
  game: GameDoc;
  players: GamePlayer[];
};

export type GameId = Id<'games'>;
export type GameDoc = Doc<'games'>;

export class Game extends Entity<GameId, GameData> {
  get status() {
    return this.data.game.status;
  }
}
