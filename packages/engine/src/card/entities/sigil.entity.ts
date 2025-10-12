import { isDefined, type MaybePromise } from '@game/shared';
import type { BoardPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import { Interceptable } from '../../utils/interceptable';
import type { PreResponseTarget, SigilBlueprint } from '../card-blueprint';
import { CARD_EVENTS, type HeroJob, type SpellSchool } from '../card.enums';
import { Ability } from './ability.entity';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASE_EVENTS, GAME_PHASES } from '../../game/game.enums';
import { CardDeclarePlayEvent } from '../card.events';

export type SerializedSigilCard = SerializedCard & {
  abilities: string[];
  job: HeroJob | null;
  spellSchool: SpellSchool | null;
  position: Pick<BoardPosition, 'zone' | 'slot'> | null;
  maxCountdown: number;
  countdown: number | null;
};

export type SigilCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, SigilCard>;
  canUseAbility: Interceptable<boolean, { card: SigilCard; ability: Ability<SigilCard> }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  maxCountdown: Interceptable<number, SigilCard>;
  shouldDecreaseCountdownOnMainPhaseStart: Interceptable<boolean, SigilCard>;
};

export const SIGIL_EVENTS = {
  SIGIL_BEFORE_COUNTDOWN_DECREASE: 'artifact.before-countdown-decrease',
  SIGIL_AFTER_COUNTDOWN_DECREASE: 'artifact.after-countdown-decrease',
  SIGIL_BEFORE_COUNTDOWN_INCREASE: 'artifact.before-countdown-increase',
  SIGIL_AFTER_COUNTDOWN_INCREASE: 'artifact.after-countdown-increase',
  SIGIL_COUNTDOWN_REACHED: 'artifact.countdown-reached'
} as const;

export class SigilCard extends Card<
  SerializedCard,
  SigilCardInterceptors,
  SigilBlueprint
> {
  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<SigilCard>[] = [];

  private _countdown: number | null = null;

  constructor(game: Game, player: Player, options: CardOptions<SigilBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        maxCountdown: new Interceptable(),
        shouldDecreaseCountdownOnMainPhaseStart: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<SigilCard>(this.game, this, ability));
    });

    this.game.on(GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE, async ({ data }) => {
      if (data.to.state !== GAME_PHASES.MAIN || data.from !== GAME_PHASES.DRAW) return;
      if (!this.shouldDecreaseCountdownOnMainPhaseStart) return;
      if (!isDefined(this.countdown)) return;
      await this.decreaseCountdown(1);
    });
  }

  get isCorrectJob() {
    return this.blueprint.job ? this.player.hero.jobs.includes(this.blueprint.job) : true;
  }

  get isCorrectSpellSchool() {
    if (!this.blueprint.spellSchool) return true;
    if (this.shouldIgnorespellSchoolRequirements) return true;

    return this.player.hero.spellSchools.includes(this.blueprint.spellSchool);
  }

  private async summon(position: BoardPosition) {
    if (this.player.boardSide.getSlot(position.zone, position.slot)!.isOccupied) {
      await this.dispose();
      return;
    }

    this.player.boardSide.summonSigil(this, position.zone, position.slot);
    this._countdown = this.maxCountdown;
    await this.blueprint.onPlay(this.game, this);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.player.boardSide.hasUnoccupiedSlot &&
        this.isCorrectJob &&
        this.isCorrectSpellSchool &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playAt(position: BoardPosition, onResolved?: () => MaybePromise<void>) {
    await this.insertInChainOrExecute(
      async () => {
        await this.summon(position);
      },
      [position],
      onResolved
    );
  }

  // immediately plays the minion regardless of current chain or interaction state
  // this is useful when summoning minions as part of another card effect
  playImmediatelyAt(position: BoardPosition) {
    return this.resolve(() => this.summon(position));
  }

  private async promptForSummonPosition() {
    const [position] = await this.game.interaction.selectMinionSlot({
      player: this.player,
      isElligible(position) {
        return (
          position.player.equals(this.player) &&
          !this.player.boardSide.isOccupied(position.zone, position.slot)
        );
      },
      canCommit(selectedSlots) {
        return selectedSlots.length === 1;
      },
      isDone(selectedSlots) {
        return selectedSlots.length === 1;
      }
    });

    return position;
  }
  async play(onResolved: () => MaybePromise<void>) {
    const position = await this.promptForSummonPosition();
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    await this.playAt(position, onResolved);
  }

  get position() {
    return this.player.boardSide.getPositionFor(this);
  }

  get slot() {
    if (!this.position) return null;
    return this.player.boardSide.getSlot(this.position.zone, this.position.slot);
  }

  get countdown() {
    return this._countdown;
  }

  get maxCountdown(): number {
    return this.interceptors.maxCountdown.getValue(this.blueprint.maxCountdown, this);
  }

  get shouldDecreaseCountdownOnMainPhaseStart(): boolean {
    return this.interceptors.shouldDecreaseCountdownOnMainPhaseStart.getValue(true, this);
  }

  async decreaseCountdown(amount: number) {
    if (this.countdown === null) return;
    console.log(
      'decreasing countdown',
      this.id,
      this.countdown,
      '->',
      Math.max(0, this.countdown - amount)
    );

    await this.game.emit(
      SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_DECREASE,
      new SigilBeforeCountdownDecreaseEvent({ card: this })
    );
    this._countdown = Math.max(0, this.countdown - amount);
    await this.game.emit(
      SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_DECREASE,
      new SigilAfterCountdownDecreaseEvent({ card: this })
    );

    if (this.countdown === 0) {
      await this.destroy();
      await this.game.emit(
        SIGIL_EVENTS.SIGIL_COUNTDOWN_REACHED,
        new SigilCountdownReachedEvent({ card: this })
      );
    }
  }

  async increaseCountdown(amount: number) {
    if (this.countdown === null) return;

    await this.game.emit(
      SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_INCREASE,
      new SigilBeforeCountdownIncreaseEvent({ card: this })
    );
    this._countdown = Math.min(this.maxCountdown, this.countdown + amount);
    await this.game.emit(
      SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_INCREASE,
      new SigilAfterCountdownIncreaseEvent({ card: this })
    );
  }

  resetCountdown() {
    this._countdown = this.maxCountdown;
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  removeFromCurrentLocation(): void {
    super.removeFromCurrentLocation();
    this._countdown = null;
  }

  serialize() {
    return {
      ...this.serializeBase(),
      abilities: this.abilities.map(a => a.id),
      job: this.blueprint.job,
      spellSchool: this.blueprint.spellSchool,
      position: this.position
        ? { zone: this.position.zone, slot: this.position.slot }
        : null,
      maxCountdown: this.maxCountdown,
      countdown: this.countdown
    };
  }
}

export class SigilBeforeCountdownDecreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilAfterCountdownDecreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilBeforeCountdownIncreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilAfterCountdownIncreaseEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export class SigilCountdownReachedEvent extends TypedSerializableEvent<
  { card: SigilCard },
  { card: string }
> {
  serialize() {
    return { card: this.data.card.id };
  }
}

export type SigilEventMap = {
  [SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_DECREASE]: SigilBeforeCountdownDecreaseEvent;
  [SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_DECREASE]: SigilAfterCountdownDecreaseEvent;
  [SIGIL_EVENTS.SIGIL_BEFORE_COUNTDOWN_INCREASE]: SigilBeforeCountdownIncreaseEvent;
  [SIGIL_EVENTS.SIGIL_AFTER_COUNTDOWN_INCREASE]: SigilAfterCountdownIncreaseEvent;
  [SIGIL_EVENTS.SIGIL_COUNTDOWN_REACHED]: SigilCountdownReachedEvent;
};
