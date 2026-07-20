import type { BetterExtract, EmptyObject, Serializable } from '@game/shared';
import { CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import { BoardSpace } from './board-space.entity';
import type { DestinyCard } from '../card/entities/destiny.entity';
import type { MinionCard } from '../card/entities/minion.entity';
import { Entity } from '../entity';
import { GAME_EVENTS } from '../game/game.events';

export type SerializedBattlefield = {
  id: string;
  spaces: string[];
  destinyCard: string | null;
  commandmentScore: number;
  opponentCommandmentScore: number;
  player: string;
};
export class Battlefield
  extends Entity<EmptyObject>
  implements Serializable<SerializedBattlefield>
{
  readonly spaces: BoardSpace[];

  destinyCard: DestinyCard | null = null;

  _commandmentScore = 0;

  constructor(
    private game: Game,
    private player: Player,
    readonly zone: BetterExtract<CardLocation, 'left_battlefield' | 'right_battlefield'>
  ) {
    super(zone, {});
    this.spaces = Array.from(
      { length: game.config.BATTLEFIELD_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone,
          playerId: player.id
        })
    );

    this.game.on(GAME_EVENTS.TURN_START, async () => {
      this._commandmentScore = 0;
    });
  }

  get opponentSpaces() {
    if (this.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      return this.player.opponent.boardSide.leftBattlefield.spaces;
    } else {
      return this.player.opponent.boardSide.rightBattlefield.spaces;
    }
  }

  get allSpaces() {
    return [...this.spaces, ...this.opponentSpaces];
  }

  get commandmentScore() {
    return this._commandmentScore;
  }

  get opponentCommandmentScore() {
    if (this.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      return this.player.opponent.boardSide.leftBattlefield.commandmentScore;
    } else {
      return this.player.opponent.boardSide.rightBattlefield.commandmentScore;
    }
  }

  get isWinning() {
    return this.commandmentScore > this.opponentCommandmentScore;
  }

  get isLosing() {
    return this.commandmentScore < this.opponentCommandmentScore;
  }

  get isDraw() {
    return this.commandmentScore === this.opponentCommandmentScore;
  }

  get opponentBattlefield() {
    if (this.zone === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      return this.player.opponent.boardSide.leftBattlefield;
    } else {
      return this.player.opponent.boardSide.rightBattlefield;
    }
  }

  async gainScore(amount: number) {
    this._commandmentScore += amount;
  }

  async loseScore(amount: number) {
    this._commandmentScore -= Math.max(0, amount);
  }

  has(card: MinionCard) {
    return this.allSpaces.some(space => space.card?.equals(card));
  }

  serialize() {
    return {
      id: this.id,
      spaces: this.spaces.map(space => space.id),
      destinyCard: this.destinyCard?.id ?? null,
      commandmentScore: this.commandmentScore,
      opponentCommandmentScore: this.opponentCommandmentScore,
      player: this.player.id
    };
  }
}
