import type { Game } from '../../game/game';

import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import {
  serializeTargets,
  type AbilityBlueprint,
  type Targets,
  type SerializedTargets,
  type SpellBlueprint
} from '../card-blueprint';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { CARD_EVENTS, type CardSpeed, type JobId } from '../card.enums';
import { CardBeforePlayEvent, CardPlayEvent } from '../card.events';
import { GAME_PHASES } from '../../game/game.enums';

export type SerializedSpellCard = SerializedCard & {
  manaCost: number;
  baseManaCost: number;
  targets: SerializedTargets | null;
  jobs: JobId[];
  speed: CardSpeed;
};
export type SpellCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SpellCard>;
  canBeTargeted: Interceptable<boolean, SpellCard>;
};

export class SpellCard extends Card<
  SerializedCard,
  SpellCardInterceptors,
  SpellBlueprint
> {
  private targets: Targets | null = null;

  constructor(game: Game, player: Player, options: CardOptions<SpellBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canBeTargeted: new Interceptable()
      },
      options
    );
  }

  get jobs() {
    return this.blueprint.jobs;
  }

  isValidMovementPosition() {
    return false;
  }

  get canBeTargeted(): boolean {
    return this.interceptors.canBeTargeted.getValue(true, this);
  }

  get isCorrectPhaseToPlay() {
    return this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN;
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.hasUnlockedAffinity &&
        this.blueprint.canPlay(this.game, this) &&
        this.isCorrectPhaseToPlay,
      this
    );
  }

  async playWithTargets(targets: Targets) {
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.targets = targets;

    await this.insertInChainOrExecute(
      async () => {
        await this.blueprint.onPlay(this.game, this, this.targets!);

        await this.dispose();

        this.targets = null;

        await this.game.emit(
          CARD_EVENTS.CARD_AFTER_PLAY,
          new CardBeforePlayEvent({ card: this })
        );
      },
      { targets: this.targets }
    );
  }

  async play() {
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardPlayEvent({ card: this })
    );
    const targetsResult = await this.blueprint.getTargets(this.game, this);
    if (targetsResult.cancelled) {
      return { cancelled: true };
    }
    await this.playWithTargets(targetsResult.result);
    return { cancelled: false };
  }

  serialize(): SerializedSpellCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      targets: this.targets ? serializeTargets(this.targets) : null,
      jobs: this.jobs.map(job => job.id) as JobId[],
      speed: this.speed
    };
  }
}
