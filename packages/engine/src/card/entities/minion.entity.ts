import { isDefined, type MaybePromise } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, AttackTarget } from '../../game/phases/combat.phase';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import {
  type AbilityBlueprint,
  type MinionBlueprint,
  type PreResponseTarget
} from '../card-blueprint';
import { CARD_EVENTS, CARD_LOCATIONS } from '../card.enums';
import {
  CardAfterDealCombatDamageEvent,
  CardAfterTakeDamageEvent,
  CardBeforeDealCombatDamageEvent,
  CardBeforeTakeDamageEvent,
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
import { GAME_PHASES, GAME_QUESTIONS } from '../../game/game.enums';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness';
import { Ability } from './ability.entity';
import { BOARD_SLOT_ZONES, type BoardSlotZone } from '../../board/board.constants';
import { HeroCard } from './hero.entity';
import {
  MINION_EVENTS,
  MinionCardHealEvent,
  MinionSummonedEvent
} from '../events/minion.events';

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
  canRetaliate: boolean;
};

export type MinionCardInterceptors = CardInterceptors & {
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canPlay: Interceptable<boolean, MinionCard>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  canBlock: Interceptable<boolean, { attacker: AttackTarget; target: AttackTarget }>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canBeBlocked: Interceptable<boolean, { attacker: Attacker }>;
  canRetaliate: Interceptable<boolean, { attacker: AttackTarget }>;
  canBeRetaliatedAgainst: Interceptable<boolean, { defender: AttackTarget }>;
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
  shouldCreateChainOnAttack: Interceptable<boolean, { target: AttackTarget }>;
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
        canRetaliate: new Interceptable(),
        canBeRetaliatedAgainst: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable(),
        dealsDamageFirst: new Interceptable(),
        shouldCreateChainOnAttack: new Interceptable()
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
    return this.remainingHp > 0 && this.location === CARD_LOCATIONS.BOARD;
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

  get shouldCreateChainOnAttack(): boolean {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;
    if (!phaseCtx.ctx.attacker.equals(this)) return false;
    if (!phaseCtx.ctx.target) return false;

    return this.interceptors.shouldCreateChainOnAttack.getValue(true, {
      target: phaseCtx.ctx.target
    });
  }

  protected async onInterceptorAdded(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
    }
  }

  protected async onInterceptorRemoved(key: MinionCardInterceptorName) {
    if (key === 'maxHp') {
      await this.checkHp(this);
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
      this.zone === BOARD_SLOT_ZONES.ATTACK_ZONE &&
      target.canBeAttacked(this) &&
      !this.game.effectChainSystem.currentChain;

    return this.interceptors.canAttack.getValue(base, {
      target
    });
  }

  canBlock(attacker: AttackTarget, target: AttackTarget) {
    if (this.location !== CARD_LOCATIONS.BOARD) return false;

    const phaseCtx = this.game.gamePhaseSystem.getContext();
    const isCorrectPhase =
      attacker.player.equals(this.player.opponent) &&
      !target?.equals(this) &&
      phaseCtx.state === GAME_PHASES.ATTACK &&
      !isDefined(phaseCtx.ctx.blocker);

    const base =
      isCorrectPhase &&
      !this._isExhausted &&
      this.zone === BOARD_SLOT_ZONES.DEFENSE_ZONE &&
      attacker.canBeBlocked(this, target);

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

  canBeRetaliatedBy(defender: AttackTarget) {
    return this.interceptors.canBeRetaliatedAgainst.getValue(true, {
      defender
    });
  }

  canRetaliate(target: AttackTarget) {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    if (phaseCtx.state !== GAME_PHASES.ATTACK) return false;
    if (!phaseCtx.ctx.target?.equals(this)) return false;
    if (phaseCtx.ctx.blocker) return false;
    if (phaseCtx.ctx.isTargetRetaliating) return false;

    return this.interceptors.canRetaliate.getValue(
      !this.isExhausted && this.atk > 0 && phaseCtx.ctx.attacker.canBeRetaliatedBy(this),
      {
        attacker: target
      }
    );
  }

  get dealsDamageFirst(): boolean {
    return this.interceptors.dealsDamageFirst.getValue(false, this);
  }

  async move() {
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

  private async checkHp(source: AnyCard) {
    if (this.remainingHp <= 0) {
      await this.destroy(source);
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
      CARD_EVENTS.CARD_BEFORE_TAKE_DAMAGE,
      new CardBeforeTakeDamageEvent({
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
      CARD_EVENTS.CARD_AFTER_TAKE_DAMAGE,
      new CardAfterTakeDamageEvent({
        card: this,
        source,
        damage,
        amount: damage.getFinalAmount(this),
        isFatal: this.remainingHp <= 0
      })
    );
    await this.checkHp(source);
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
      { targets: [], onResolved, zone }
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
        phaseCtx.state === GAME_PHASES.ATTACK
          ? this.canBlock(phaseCtx.ctx.attacker, phaseCtx.ctx.target!)
          : false,
      canRetaliate:
        phaseCtx.state === GAME_PHASES.ATTACK
          ? this.canRetaliate(phaseCtx.ctx.attacker)
          : false
    };
  }
}
