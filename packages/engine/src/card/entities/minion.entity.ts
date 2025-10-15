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
import { CARD_EVENTS, type HeroJob, type SpellSchool } from '../card.enums';
import { CardDeclarePlayEvent } from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type AnyCard,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import type { BoardPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import { GAME_PHASES } from '../../game/game.enums';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness';
import type { BoardSlot, SerializedBoardSlot } from '../../board/board-slot.entity';
import { Ability } from './ability.entity';
import { type BoardSlotZone } from '../../board/board.constants';
import { MeleeAttackRange, type AttackRange } from '../attack-range';
import { HeroCard } from './hero.entity';
import { SingleTargetAOE, type AttackAOE } from '../attack-aoe';
import { CorruptedGamephaseContextError } from '../../game/game-error';

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
  job: HeroJob | null;
  spellSchool: SpellSchool | null;
  position: Pick<BoardPosition, 'zone' | 'slot'> | null;
  canCounterattack: boolean;
};

export type MinionCardInterceptors = CardInterceptors & {
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canPlay: Interceptable<boolean, MinionCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeCounterattacked: Interceptable<boolean, { defender: AttackTarget }>;
  canCounterattack: Interceptable<boolean, { attacker: AttackTarget }>;
  canUseAbility: Interceptable<
    boolean,
    { card: MinionCard; ability: Ability<MinionCard> }
  >;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
  attackRanges: Interceptable<AttackRange[], MinionCard>;
  attackAOEs: Interceptable<AttackAOE[], MinionCard>;
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
        canBeAttacked: new Interceptable(),
        canCounterattack: new Interceptable(),
        canBeCounterattacked: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        attackRanges: new Interceptable(),
        attackAOEs: new Interceptable()
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

  get position() {
    return this.player.boardSide.getPositionFor(this);
  }

  get slot() {
    if (!this.position) return null;
    return this.player.boardSide.getSlot(this.position.zone, this.position.slot);
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

  get job() {
    return this.blueprint.job;
  }

  get spellSchool() {
    return this.blueprint.spellSchool;
  }

  get attackRanges(): AttackRange[] {
    return this.interceptors.attackRanges.getValue(
      [new MeleeAttackRange(this.game, this)],
      this
    );
  }

  get attackAOEs(): AttackAOE[] {
    return this.interceptors.attackAOEs.getValue([new SingleTargetAOE()], this);
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

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeCounterattackedBy(defender: AttackTarget) {
    return this.interceptors.canBeCounterattacked.getValue(true, {
      defender
    });
  }

  canCounterattack(target: AttackTarget) {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK || !phaseCtx.ctx.target?.equals(this)) {
      return false;
    }

    return this.interceptors.canCounterattack.getValue(
      !this.isExhausted &&
        this.atk > 0 &&
        phaseCtx.ctx.attacker.canBeCounterattackedBy(this),
      {
        attacker: target
      }
    );
  }

  async counterattack() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK || !phaseCtx.ctx.target?.equals(this)) {
      throw new CorruptedGamephaseContextError();
    }
    await phaseCtx.ctx.counterAttack();
  }

  async moveTo(position: BoardPosition, allowSwap = false) {
    if (!this.position) return;

    return this.player.boardSide.moveMinion(this.position, position, { allowSwap });
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

  getAffectedCardsForAttack(target: AttackTarget) {
    if (target instanceof HeroCard) {
      return [target];
    }
    const affectedCards = new Set<MinionCard | HeroCard>();
    this.attackAOEs.forEach(aoe => {
      aoe.getAffectedCards(target.slot!).forEach(card => affectedCards.add(card));
    });

    return Array.from(affectedCards);
  }

  async dealDamage(target: AttackTarget, damage: CombatDamage) {
    const affectedCards = this.getAffectedCardsForAttack(target);
    await this.game.emit(
      MINION_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE,
      new MinionCardBeforeDealCombatDamageEvent({
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
      MINION_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE,
      new MinionCardAfterDealCombatDamageEvent({
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
      new MinionCardBeforeTakeDamageEvent({ card: this, source, damage })
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

    this.player.boardSide.summonMinion(this, position.zone, position.slot);
    await this.blueprint.onPlay(this.game, this);

    await this.game.emit(
      MINION_EVENTS.MINION_SUMMONED,
      new MinionSummonedEvent({ card: this, position })
    );

    if (this.hasSummoningSickness && this.game.config.SUMMONING_SICKNESS) {
      await (this as MinionCard).modifiers.add(
        new SummoningSicknessModifier(this.game, this)
      );
    }
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

  get potentialAttackTargets() {
    if (this.location !== 'board') return [];

    const result: Array<MinionCard | HeroCard> = this.player.opponent.boardSide
      .getAllMinions()
      .filter(minion =>
        this.attackRanges.some(
          range => range.canAttack(minion.slot!) && this.canAttack(minion)
        )
      );

    if (
      this.attackRanges.some(range => range.canAttackHero()) &&
      this.canAttack(this.player.opponent.hero)
    ) {
      result.push(this.player.opponent.hero);
    }

    return result;
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
      position: this.position
        ? { zone: this.position.zone, slot: this.position.slot }
        : null,
      abilities: this.abilities.map(ability => ability.id),
      job: this.blueprint.job ?? null,
      spellSchool: this.blueprint.spellSchool ?? null,
      canCounterattack:
        phaseCtx.state === GAME_PHASES.ATTACK &&
        phaseCtx.ctx.target?.equals(this) &&
        phaseCtx.ctx.target?.canCounterattack(this)
          ? this.canCounterattack(phaseCtx.ctx.attacker) &&
            phaseCtx.ctx.attacker.canBeCounterattackedBy(this)
          : false
    };
  }
}

export const MINION_EVENTS = {
  MINION_SUMMONED: 'minion.summoned',
  MINION_BEFORE_TAKE_DAMAGE: 'minion.before-take-damage',
  MINION_AFTER_TAKE_DAMAGE: 'minion.after-take-damage',
  MINION_BEFORE_DEAL_COMBAT_DAMAGE: 'minion.before-deal-combat-damage',
  MINION_AFTER_DEAL_COMBAT_DAMAGE: 'minion.after-deal-combat-damage',
  MINION_BEFORE_HEAL: 'minion.before-heal',
  MINION_AFTER_HEAL: 'minion.after-heal',
  MINION_BEFORE_USE_ABILITY: 'minion.before-use-ability',
  MINION_AFTER_USE_ABILITY: 'minion.after-use-ability',
  MINION_BEFORE_MOVE: 'minion.before-move',
  MINION_AFTER_MOVE: 'minion.after-move'
} as const;
export type MinionEvents = Values<typeof MINION_EVENTS>;

export class MinionCardBeforeDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard;
    target: AttackTarget;
    affectedCards: Array<MinionCard | HeroCard>;
    damage: CombatDamage;
  },
  { card: string; target: string; damage: number; affectedCards: string[] }
> {
  serialize() {
    return {
      card: this.data.card.id,
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target),
      affectedCards: this.data.affectedCards.map(card => card.id)
    };
  }
}

export class MinionCardAfterDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard;
    target: AttackTarget;
    damage: CombatDamage;
    affectedCards: Array<MinionCard | HeroCard>;
  },
  {
    card: string;
    target: string;
    damage: number;
    affectedCards: string[];
    isFatal: boolean;
  }
> {
  serialize() {
    return {
      card: this.data.card.id,
      target: this.data.target.id,
      damage: this.data.damage.getFinalAmount(this.data.target),
      affectedCards: this.data.affectedCards.map(card => card.id),
      isFatal: !this.data.target.isAlive
    };
  }
}

export class MinionCardBeforeTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage },
  { card: string; source: string; damage: { type: DamageType; amount: number } }
> {
  serialize() {
    return {
      card: this.data.card.id,
      source: this.data.source.id,
      damage: {
        type: this.data.damage.type,
        amount: this.data.damage.getFinalAmount(this.data.card)
      }
    };
  }
}

export class MinionCardAfterTakeDamageEvent extends TypedSerializableEvent<
  { card: MinionCard; source: AnyCard; damage: Damage; isFatal: boolean },
  {
    card: SerializedMinionCard;
    source: string;
    damage: { type: DamageType; amount: number };
    isFatal: boolean;
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
  { card: MinionCard; position: { zone: BoardSlotZone; slot: number } },
  { card: SerializedMinionCard; position: { zone: BoardSlotZone; slot: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: {
        zone: this.data.position.zone,
        slot: this.data.position.slot
      }
    };
  }
}

export class MinionMoveEvent extends TypedSerializableEvent<
  { card: MinionCard; from: BoardSlot; to: BoardSlot },
  {
    card: SerializedMinionCard;
    from: SerializedBoardSlot;
    to: SerializedBoardSlot;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      from: this.data.from.serialize(),
      to: this.data.to.serialize()
    };
  }
}

export type MinionCardEventMap = {
  [MINION_EVENTS.MINION_BEFORE_TAKE_DAMAGE]: MinionCardBeforeTakeDamageEvent;
  [MINION_EVENTS.MINION_AFTER_TAKE_DAMAGE]: MinionCardAfterTakeDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE]: MinionCardBeforeDealCombatDamageEvent;
  [MINION_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE]: MinionCardAfterDealCombatDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_BEFORE_MOVE]: MinionMoveEvent;
  [MINION_EVENTS.MINION_AFTER_MOVE]: MinionMoveEvent;
};
