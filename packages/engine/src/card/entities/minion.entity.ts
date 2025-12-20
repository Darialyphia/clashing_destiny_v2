import type { MaybePromise, Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage, type DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type MinionBlueprint,
  type PreResponseTarget
} from '../card-blueprint';
import { CARD_EVENTS } from '../card.enums';
import {
  CardAfterDealCombatDamageEvent,
  CardBeforeDealCombatDamageEvent,
  CardDeclarePlayEvent
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES, GAME_QUESTIONS } from '../../game/game.enums';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness';
import { Ability } from './ability.entity';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from '../../board/board.constants';
import { HeroCard } from './hero.entity';

export type SerializedMinionCard = SerializedCard & {
  potentialAttackTargets: string[];
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  maxHp: number;
  remainingHp: number;
  manaCost: number;
  baseManaCost: number;
  abilities: string[];
  zone: BoardSlotZone | null;
  canBlock: boolean;
};

export type MinionCardInterceptors = CardInterceptors & {
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canPlay: Interceptable<boolean, MinionCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBlock: Interceptable<boolean, { attacker: AttackTarget; target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeBlocked: Interceptable<boolean, { attacker: Attacker }>;
  canBeDefended: Interceptable<boolean, { defender: AttackTarget }>;
  canUseAbility: Interceptable<
    boolean,
    { card: MinionCard; ability: Ability<MinionCard> }
  >;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
  dealsDamageFirst: Interceptable<boolean, MinionCard>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

export class MinionCard extends Card<
  SerializedCard,
  MinionCardInterceptors,
  MinionBlueprint
> {
  private damageTaken = 0;

  readonly abilityTargets = new Map<string, PreResponseTarget[]>();

  readonly abilities: Ability<MinionCard>[] = [];

  constructor(game: Game, player: Player, options: CardOptions<MinionBlueprint>) {
    super(
      game,
      player,
      {
        ...makeCardInterceptors(),
        canPlay: new Interceptable(),
        canAttack: new Interceptable(),
        canBlock: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canBeBlocked: new Interceptable(),
        canBeDefended: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        dealsDamageFirst: new Interceptable()
      },
      options
    );

    this.blueprint.abilities.forEach(ability => {
      this.abilities.push(new Ability<MinionCard>(this.game, this, ability));
    });
  }

  get hasSummoningSickness(): boolean {
    return this.interceptors.hasSummoningSickness.getValue(true, this);
  }

  get zone(): BoardSlotZone | null {
    return this.player.boardSide.getZoneFor(this);
  }

  get isAlive() {
    return this.remainingHp > 0 && this.location === 'board';
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

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.attacker.equals(this);
  }

  get isAttackTarget() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.target?.equals(this);
  }

  protected async onInterceptorAdded(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  protected async onInterceptorRemoved(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp();
    }
  }

  resetDamageTaken() {
    this.damageTaken = 0;
  }

  removeFromCurrentLocation(): void {
    super.removeFromCurrentLocation();
    this.damageTaken = 0;
  }

  canBeTargeted(source: AnyCard) {
    return this.interceptors.canBeTargeted.getValue(true, {
      source
    });
  }

  canAttack(target: AttackTarget) {
    const base =
      !this._isExhausted &&
      this.atk > 0 &&
      target.canBeAttacked(this) &&
      !this.game.effectChainSystem.currentChain;

    return this.interceptors.canAttack.getValue(base, {
      target
    });
  }

  canBlock(attacker: AttackTarget, target: AttackTarget) {
    const base = !this._isExhausted && attacker.canBeBlocked(this, target);
    return this.interceptors.canBlock.getValue(base, {
      attacker,
      target
    });
  }

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeBlocked(attacker: AttackTarget) {
    return this.interceptors.canBeBlocked.getValue(true, {
      attacker
    });
  }

  canBeDefended(defender: AttackTarget) {
    return this.interceptors.canBeDefended.getValue(true, {
      defender
    });
  }

  get dealsDamageFirst(): boolean {
    return this.interceptors.dealsDamageFirst.getValue(false, this);
  }

  async moveTo() {
    if (this.location !== 'board') return;

    return this.player.boardSide.move(this);
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

  getReceivedDamage(damage: Damage) {
    return this.interceptors.receivedDamage.getValue(damage.baseAmount, {
      damage
    });
  }

  private async checkHp(shouldDelay = false) {
    if (this.remainingHp <= 0) {
      if (shouldDelay) {
        await this.game.inputSystem.schedule(async () => {
          await this.destroy();
        });
      } else {
        await this.destroy();
      }
    }
  }

  async dealDamage(target: AttackTarget, damage: CombatDamage) {
    const affectedCards = [target];
    await this.game.emit(
      CARD_EVENTS.CARD_BEFORE_DEAL_COMBAT_DAMAGE,
      new CardBeforeDealCombatDamageEvent({
        card: this,
        target,
        damage,
        affectedCards
      })
    );

    for (const card of affectedCards) {
      await card.takeDamage(this, damage);
    }

    await this.game.emit(
      CARD_EVENTS.CARD_AFTER_DEAL_COMBAT_DAMAGE,
      new CardAfterDealCombatDamageEvent({
        card: this,
        target,
        damage,
        affectedCards
      })
    );
  }

  async takeDamage(source: AnyCard, damage: Damage) {
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE,
      new MinionCardBeforeTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this)
      })
    );

    this.damageTaken = Math.min(
      this.damageTaken + damage.getFinalAmount(this),
      this.maxHp
    );
    await this.game.emit(
      MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE,
      new MinionCardAfterTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this),
        isFatal: this.remainingHp <= 0
      })
    );
    await this.checkHp(damage instanceof CombatDamage);
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

  addAbility(ability: AbilityBlueprint<MinionCard, PreResponseTarget>) {
    const newAbility = new Ability<MinionCard>(this.game, this, ability);
    this.abilities.push(newAbility);
    return newAbility;
  }

  removeAbility(abilityId: string) {
    const index = this.abilities.findIndex(a => a.abilityId === abilityId);
    if (index === -1) return;
    this.abilityTargets.delete(abilityId);
  }

  private async summon(zone: BoardSlotZone) {
    this.player.boardSide.summonMinion(this, zone);
    if (this.hasSummoningSickness && this.game.config.SUMMONING_SICKNESS) {
      await (this as MinionCard).modifiers.add(
        new SummoningSicknessModifier(this.game, this)
      );
    }
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      MINION_EVENTS.MINION_SUMMONED,
      new MinionSummonedEvent({ card: this, zone })
    );
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
    return (await this.game.interaction.askQuestion({
      questionId: GAME_QUESTIONS.SUMMON_POSITION,
      label: 'Select which zone to summon the minion to',
      player: this.player,
      source: this,
      minChoiceCount: 1,
      maxChoiceCount: 1,
      choices: [
        { id: BOARD_SLOT_ZONES.ATTACK_ZONE, label: 'Attack Zone' },
        { id: BOARD_SLOT_ZONES.DEFENSE_ZONE, label: 'Defense Zone' }
      ]
    })) as BoardSlotZone;
  }

  async play(onResolved: () => MaybePromise<void>) {
    const zone = await this.promptForSummonZone();
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );

    await this.playAt(zone, onResolved);
  }

  get potentialAttackTargets(): Array<MinionCard | HeroCard> {
    if (this.location !== 'board') return [];

    return [
      this.player.opponent.hero,
      ...this.player.opponent.boardSide.getAllMinions()
    ].filter(minion => this.canAttack(minion));
  }

  serialize(): SerializedMinionCard {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return {
      ...this.serializeBase(),
      manaCost: this.manaCost,
      baseManaCost: this.manaCost,
      potentialAttackTargets: this.potentialAttackTargets.map(target => target.id),
      atk: this.atk,
      baseAtk: this.blueprint.atk,
      maxHp: this.maxHp,
      baseMaxHp: this.blueprint.maxHp,
      remainingHp: this.remainingHp,
      zone: this.zone,
      abilities: this.abilities.map(ability => ability.id),
      canBlock:
        phaseCtx.state === GAME_PHASES.ATTACK &&
        !phaseCtx.ctx.attacker.player.equals(this.player) &&
        !phaseCtx.ctx.target?.equals(this) &&
        !phaseCtx.ctx.blocker
          ? this.canBlock(phaseCtx.ctx.attacker, phaseCtx.ctx.target!)
          : false
    };
  }
}

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_TAKE_DAMAGE: 'minion.before-take-damage',
  MINION_AFTER_TAKE_DAMAGE: 'minion.after-take-damage',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal',
  MINION_BEFORE_USE_ABILITY: 'minion.before-use-ability',
  MINION_AFTER_USE_ABILITY: 'minion.after-use-ability'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardBeforeTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage; amount: number },
  {
    card: string;
    source: string;
    damage: { type: DamageType; amount: number };
    amount: number;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      source: this.data.source.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      amount: this.data.amount
    };
  }
}

export class MinionCardAfterTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage; isFatal: boolean; amount: number },
  {
    card: SerializedMinionCard;
    source: string;
    damage: { type: DamageType; amount: number };
    isFatal: boolean;
    amount: number;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      source: this.data.source.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      },
      isFatal: this.data.isFatal,
      amount: this.data.amount
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
  { card: MinionCard; zone: BoardSlotZone },
  { card: SerializedMinionCard; zone: BoardSlotZone }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      zone: this.data.zone
    };
  }
}

export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE]: MinionCardAfterTakeDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
};
