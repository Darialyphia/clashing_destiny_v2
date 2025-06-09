import type { Game } from '../../game/game';
import { GAME_PHASES } from '../../game/game.enums';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { TalentBlueprint } from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import { CardBeforePlayEvent, CardAfterPlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedTalentCard = SerializedCard & {
  destinyCost: number;
};
export type AbilityCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, TalentCard>;
};

export class TalentCard extends Card<
  SerializedCard,
  AbilityCardInterceptors,
  TalentBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<TalentBlueprint>) {
    super(
      game,
      player,
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  get level() {
    return this.blueprint.level;
  }

  get needAffinityToBePlayed() {
    return this.interceptors.needAffinityToBePlayed.getValue(true, {});
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.player.hero.hasLineage(this.blueprint.heroId) &&
        this.canPayDestinyCost &&
        this.player.hero.level >= this.level &&
        this.hasAffinityMatch &&
        this.location === 'destinyDeck' &&
        this.game.gamePhaseSystem.getContext().state === GAME_PHASES.DESTINY &&
        this.player.canAddTalent(this),
      this
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();
    await this.player.addTalent(this);
    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize(): SerializedTalentCard {
    return {
      ...this.serializeBase(),
      destinyCost: this.blueprint.destinyCost
    };
  }
}
