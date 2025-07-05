import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage, type DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import { type MinionBlueprint, type PreResponseTarget } from '../card-blueprint';
import { CARD_EVENTS, type Affinity } from '../card.enums';
import { CardAfterPlayEvent, CardBeforePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES } from '../../game/game.enums';
import type { HeroCard } from './hero.entity';

export type SerializedMinionCard = SerializedCard & {
  baseAtk: number;
  speed: number;
  atk: number;
  baseMaxHp: number;
  maxHp: number;
  remainingHp: number;
  affinity: Affinity;
  manaCost: number;
  baseManaCost: number;
};
export type MinionCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, MinionCard>;
  canAttack: Interceptable<boolean, { target: MinionCard | HeroCard }>;
  canBeAttacked: Interceptable<boolean, { target: MinionCard | HeroCard }>;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
  speed: Interceptable<number, MinionCard>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_TAKE_DAMAGE: 'minion.before-take-damage',
  MINION_AFTER_TAKE_DAMAGE: 'minion.after-take-damage',
  MINION_BEFORE_DEAL_COMBAT_DAMAGE: 'minion.before-deal-combat-damage',
  MINION_AFTER_DEAL_COMBAT_DAMAGE: 'minion.after-deal-combat-damage',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard;
    target: MinionCard | HeroCard;
    damage: CombatDamage;
  },
  { card: SerializedMinionCard; target: string; damage: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target)
    };
  }
}

export class MinionCardBeforeTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; damage: Damage },
  { card: SerializedMinionCard; damage: { type: DamageType; amount: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      }
    };
  }
}

export class MinionCardAfterTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; damage: Damage; isFatal: boolean },
  {
    card: SerializedMinionCard;
    damage: { type: DamageType; amount: number };
    isFatal: boolean;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      isFatal: this.data.isFatal
    };
  }
}

export class MinionCardHealEvent extends TypedSerializableEvent<
  { card: MinionCard; amount: number },
  { card: SerializedMinionCard; amount: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      amount: this.data.amount
    };
  }
}

export class MinionUsedAbilityEvent extends TypedSerializableEvent<
  { card: MinionCard; abilityId: string },
  { card: SerializedMinionCard; abilityId: string }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      abilityId: this.data.abilityId
    };
  }
}

export class MinionSummonedEvent extends TypedSerializableEvent<
  { card: MinionCard; position: number },
  { card: SerializedMinionCard; position: number }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.position
    };
  }
}

export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE]: MinionCardAfterTakeDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE]: MinionCardDealCombatDamageEvent;
  [MINION_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE]: MinionCardDealCombatDamageEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
};

export class MinionCard extends Card<
  SerializedCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  private damageTaken = 0;

  private abilityTargets = new Map<string, PreResponseTarget[]>();

  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canAttack: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        speed: new Interceptable()
      },
      options
    );
  }

  get position() {
    return this.player.boardSide.minionZone.findIndex(minion => minion.equals(this));
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === 'board';
  }

  get speed(): number {
    return this.interceptors.speed.getValue(this.blueprint.speed, this);
  }

  get atk(): number {
    return this.interceptors.atk.getValue(this.blueprint.atk, this);
  }

  get maxHp(): number {
    return this.interceptors.maxHp.getValue(this.blueprint.maxHp, this);
  }

  get remainingHp(): number {
    return Math.max(this.maxHp - this.damageTaken, 0);
  }

  protected async onInterceptorAdded(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: MinionCard | HeroCard) {
    return this.interceptors.canAttack.getValue(!this._isExhausted && this.atk > 0, {
      target
    });
  }

  canBeAttacked(target: MinionCard | HeroCard) {
    return this.interceptors.canBeAttacked.getValue(true, {
      target
    });
  }

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  private async checkHp() {
    if (this.remainingHp <= 0) {
      await this.destroy();
    }
  }

  async dealDamage(target: MinionCard | HeroCard, damage: CombatDamage) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE,
      new MinionCardDealCombatDamageEvent({ card: this, target, damage })
    );

    await target.takeDamage(this, damage);

    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
      new MinionCardDealCombatDamageEvent({ card: this, target, damage })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE,
      new MinionCardBeforeTakeDamageEvent({ card: this, damage })
    );

    this.damageTaken = Math.min(
      this.damageTaken + damage.getFinalAmount(this),
      this.maxHp
    );
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE,
      new MinionCardAfterTakeDamageEvent({
        card: this,
        damage,
        isFatal: this.remainingHp <= 0
      })
    );
    await this.checkHp();
  }

  async heal(heal: number) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
    this.damageTaken = Math.max(this.damageTaken - heal, 0);
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_HEAL,
      new MinionCardHealEvent({ card: this, amount: heal })
    );
  }

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPayManaCost &&
        this.location === 'hand' &&
        this.game.gamePhaseSystem.getContext().state === GAME_PHASES.MAIN &&
        this.hasAffinityMatch &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async play() {
    // const [position] = await this.game.interaction.selectMinionSlot({
    //   player: this.player,
    //   isElligible(position) {
    //     return (
    //       position.player.equals(this.player) &&
    //       !this.player.boardSide.isOccupied(position.zone, position.slot)
    //     );
    //   },
    //   canCommit(selectedSlots) {
    //     return selectedSlots.length === 1;
    //   },
    //   isDone(selectedSlots) {
    //     return selectedSlots.length === 1;
    //   }
    // });
    const index = 0;
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_PLAY,
      new CardBeforePlayEvent({ card: this })
    );
    this.updatePlayedAt();
    this.removeFromCurrentLocation();

    this.player.boardSide.summonMinion(this, 0);
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      MINION_EVENTS.MINION_SUMMONED,
      new MinionSummonedEvent({ card: this, position: index })
    );

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_PLAY,
      new CardAfterPlayEvent({ card: this })
    );
  }

  serialize(): SerializedMinionCard {
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.blueprint.manaCost,
      speed: this.speed,
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.remainingHp,
      affinity: this.blueprint.affinity
    };
  }
}
