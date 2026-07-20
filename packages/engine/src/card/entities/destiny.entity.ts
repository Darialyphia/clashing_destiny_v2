import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { type DestinyBlueprint } from '../card-blueprint';
import { CARD_LOCATIONS } from '../card.enums';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { MinionCard } from './minion.entity';

export type SerializedDestinyCard = SerializedCard;
export type DestinyCardInterceptors = CardInterceptors;

export class DestinyCard extends Card<
  SerializedDestinyCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(game, player, makeCardInterceptors(), options);
  }

  canPlay(): boolean {
    return true;
  }

  async play() {
    await this.blueprint.onPlay(this.game, this);

    return { cancelled: false };
  }

  get battlefield() {
    if (
      this.location !== CARD_LOCATIONS.LEFT_BATTLEFIELD &&
      this.location !== CARD_LOCATIONS.RIGHT_BATTLEFIELD
    ) {
      return null;
    }

    if (this.location === CARD_LOCATIONS.LEFT_BATTLEFIELD) {
      return this.player.boardSide.leftBattlefield;
    } else {
      return this.player.boardSide.rightBattlefield;
    }
  }

  isOnSameBattlefieldAs(card: MinionCard) {
    if (!this.battlefield || !card.isOnBattlefield) return false;
    return this.battlefield!.allSpaces.map(space => space.card)
      .filter(isDefined)
      .some(c => c.equals(card));
  }

  serialize(): SerializedDestinyCard {
    return {
      ...this.serializeBase()
    };
  }
}
