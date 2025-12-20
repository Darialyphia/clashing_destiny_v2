import { isDefined, type MaybePromise } from '@game/shared';
import { Interceptable } from '../../utils/interceptable';
import type {
  AbilityBlueprint,
  PreResponseTarget,
  SigilBlueprint
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
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
import { GAME_PHASE_EVENTS, GAME_PHASES, GAME_QUESTIONS } from '../../game/game.enums';
import { CardDeclarePlayEvent } from '../card.events';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from '../../board/board.constants';

export type SerializedSigilCard = SerializedCard & {
  abilities: string[];
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

  private async summon(zone: BoardSlotZone) {
    this.player.boardSide.summonSigil(this, zone);
    this._countdown = this.maxCountdown;
    await this.blueprint.onPlay(this.game, this);
  }

  replaceAbilityTarget(abilityId: string, oldTarget: AnyCard, newTarget: AnyCard) {
    const targets = this.abilityTargets.get(abilityId);
    if (!targets) return;
    if (newTarget instanceof Card) {
      const index = targets.findIndex(t => t instanceof Card && t.equals(oldTarget));
      if (index === -1) return;

      const oldTarget = targets[index] as AnyCard;
      oldTarget.clearTargetedBy({ type: 'ability', abilityId, card: this });

      targets[index] = newTarget;
      newTarget.targetBy({ type: 'ability', abilityId, card: this });
    }
  }

  canUseAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return false;

    return this.interceptors.canUseAbility.getValue(ability.canUse, {
      card: this,
      ability
    });
  }

  addAbility(ability: AbilityBlueprint<SigilCard, PreResponseTarget>) {
    const newAbility = new Ability<SigilCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilityTargets.delete(abilityId);
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase && this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playAt(zone: BoardSlotZone, onResolved?: () => MaybePromise<void>) {
    await this.insertInChainOrExecute(
      async () => {
        await this.summon(zone);
      },
      [],
      onResolved
    );
  }

  // immediately plays the minion regardless of current chain or interaction state
  // this is useful when summoning minions as part of another card effect
  playImmediatelyAt(zone: BoardSlotZone) {
    return this.resolve(() => this.summon(zone));
  }

  private async promptForSummonZone() {
    const [zone] = await this.game.interaction.askQuestion({
      questionId: GAME_QUESTIONS.SUMMON_POSITION,
      label: 'Select which zone to summon the sigil to',
      player: this.player,
      source: this,
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: [
        { id: BOARD_SLOT_ZONES.ATTACK_ZONE, label: 'Attack Zone' },
        { id: BOARD_SLOT_ZONES.DEFENSE_ZONE, label: 'Defense Zone' }
      ]
    });

    return zone as BoardSlotZone;
  }

  async play(onResolved: () => MaybePromise<void>) {
    const zone = await this.promptForSummonZone();
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    await this.playAt(zone, onResolved);
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
