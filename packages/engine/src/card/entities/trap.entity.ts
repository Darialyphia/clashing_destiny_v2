import type { TrapBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_LOCATIONS } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';

// eslint-disable-next-line @typescript-eslint/ban-types
export type SerializedTrapCard = SerializedCard & {
  unplayableReason: string | null;
  manaCost: number;
  baseManaCost: number;
  triggerCost: number;
  baseTriggerCost: number;
};

export type TrapCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, TrapCard>;
  triggerCost: Interceptable<number, TrapCard>;
};

export class TrapCard extends Card<
  SerializedTrapCard,
  TrapCardInterceptors,
  TrapBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<TrapBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        triggerCost: new Interceptable()
      },
      options
    );
  }

  get triggerCost(): number {
    return this.interceptors.triggerCost.getValue(this.blueprint.triggerCost, this);
  }

  get canAffordTriggerCost(): boolean {
    return this.player.mana >= this.triggerCost;
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  get unplayableReason() {
    if (!this.canPayManaCost) {
      return "You don't have enough mana.";
    }

    return this.canPlay() ? null : 'You cannot play this card.';
  }

  removeFromBoard(): Promise<void> {
    return Promise.resolve();
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );

    const stopTrigger = this.game.on('*', async event => {
      if (!this.canAffordTriggerCost) return;
      if (this.blueprint.shouldTrigger(this.game, this, event.data.event)) {
        await this.player.manaManager.spend(this.triggerCost);
        await this.blueprint.onTrigger(this.game, this, event.data.event);
        await this.dispose();
        stopTrigger();
        stopLocationWatch();
      }
    });

    const stopLocationWatch = this.game.on(
      CARD_EVENTS.CARD_AFTER_CHANGE_LOCATION,
      async event => {
        if (!event.data.card.equals(this)) return;
        if (event.data.from === CARD_LOCATIONS.BASE) {
          stopTrigger();
          stopLocationWatch();
        }
      }
    );

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );

    return { cancelled: false };
  }

  serialize() {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      unplayableReason: this.unplayableReason,
      triggerCost: this.triggerCost,
      baseTriggerCost: this.blueprint.triggerCost
    };
  }
}
