import type { BetterExtract, Serializable } from '@game/shared';
import { CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import { BoardSpace } from './board-space.entity';
import type { DestinyCard } from '../card/entities/destiny.entity';
import { isMinion } from '../card/card-utils';
import type { MinionCard } from '../card/entities/minion.entity';

export type SerializedBattlefield = {
  spaces: string[];
  destinyCard: string | null;
  commandmentScore: number;
};
export class Battlefield implements Serializable<SerializedBattlefield> {
  readonly spaces: BoardSpace[];

  destinyCard: DestinyCard | null = null;

  constructor(
    private game: Game,
    private player: Player,
    readonly zone: BetterExtract<CardLocation, 'left_battlefield' | 'right_battlefield'>
  ) {
    this.spaces = Array.from(
      { length: game.config.BATTLEFIELD_SLOTS },
      (_, i) =>
        new BoardSpace(game, {
          index: i,
          zone,
          playerId: player.id
        })
    );
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
    return this.spaces.reduce((score, space) => {
      if (!space.card) return score;
      if (!isMinion(space.card)) return score;
      return score + space.card.commandment;
    }, 0);
  }

  has(card: MinionCard) {
    return this.allSpaces.some(space => space.card?.equals(card));
  }

  serialize() {
    return {
      spaces: this.spaces.map(space => space.id),
      destinyCard: this.destinyCard?.id ?? null,
      commandmentScore: this.commandmentScore
    };
  }
}
