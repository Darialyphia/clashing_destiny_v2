import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { type RuneBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedRuneCard = SerializedCard;
export type RuneCardInterceptors = CardInterceptors;

export class RuneCard extends Card<
  SerializedRuneCard,
  RuneCardInterceptors,
  RuneBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<RuneBlueprint>) {
    super(game, player, makeCardInterceptors(), options);
  }

  canPlay(): boolean {
    return true;
  }

  async play() {
    await this.resolve(async () => {
      await this.reveal();
      this.removeFromCurrentLocation();
      this.player.cardManager.placeInRuneZone(this);
      await this.blueprint.onPlay(this.game, this);
    });

    return { cancelled: false };
  }

  serialize(): SerializedRuneCard {
    return {
      ...this.serializeBase()
    };
  }
}
