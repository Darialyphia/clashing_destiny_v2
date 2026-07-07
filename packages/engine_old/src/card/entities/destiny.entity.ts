import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import { type DestinyBlueprint } from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { type JobId } from '../card.enums';
import { GAME_PHASES } from '../../game/game.enums';

export type SerializedDestinyCard = SerializedCard & {
  expCost: number;
  baseExpCost: number;
  jobs: JobId[];
};

export type DestinyCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, DestinyCard>;
  expCost: Interceptable<number, DestinyCard>;
};

export class DestinyCard extends Card<
  SerializedDestinyCard,
  DestinyCardInterceptors,
  DestinyBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<DestinyBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        expCost: new Interceptable()
      },
      options
    );
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  get isCorrectPhaseToPlay() {
    const validPhases: string[] = [GAME_PHASES.MAIN];
    return validPhases.includes(this.game.gamePhaseSystem.getContext().state);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.blueprint.canPlay(this.game, this) &&
        this.isCorrectPhaseToPlay,
      this
    );
  }

  async play() {
    return this.resolve(() => this.blueprint.onPlay(this.game, this));
  }

  get expCost(): number {
    return this.interceptors.expCost.getValue(this.blueprint.expCost, this);
  }

  serialize(): SerializedDestinyCard {
    return {
      ...this.serializeBase(),
      expCost: this.expCost,
      baseExpCost: this.blueprint.expCost,
      jobs: this.jobs.map(job => job.id) as JobId[]
    };
  }
}
