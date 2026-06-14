import type { BetterExtract } from '@game/shared';
import { CARD_LOCATIONS, type CardLocation } from '../card/card.enums';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import { BoardSpace } from './board-space.entity';
import type { DestinyCard } from '../card/entities/destiny.entity';

export class Battlefield {
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
}
