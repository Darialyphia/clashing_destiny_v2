import type { Values } from '@game/shared';
import type { Game } from '../../game/game';
import type { Attacker, Defender, AttackTarget } from '../../game/phases/combat.phase';
import type { Player } from '../../player/player.entity';
import { CombatDamage, type Damage, type DamageType } from '../../utils/damage';
import { Interceptable } from '../../utils/interceptable';
import { type MinionBlueprint, type PreResponseTarget } from '../card-blueprint';
import { CARD_EVENTS, type Affinity } from '../card.enums';
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
import type { MinionPosition } from '../../game/interactions/selecting-minion-slots.interaction';
import { GAME_PHASES } from '../../game/game.enums';
import { SummoningSicknessModifier } from '../../modifier/modifiers/summoning-sickness';
import type {
  BoardMinionSlot,
  SerializedBoardMinionSlot
} from '../../board/board-minion-slot.entity';
import { Ability } from './ability.entity';
import { type MinionSlotZone } from '../../board/board;constants';

export type SerializedMinionCard = SerializedCard & {
  potentialAttackTargets: string[];
  baseAtk: number;
  atk: number;
  baseMaxHp: number;
  maxHp: number;
  remainingHp: number;
  affinity: Affinity;
  manaCost: number;
  baseManaCost: number;
  abilities: string[];
  position: Pick<MinionPosition, 'zone' | 'slot'> | null;
};
export type MinionCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, MinionCard>;
  canBeCounterattacked: Interceptable<boolean, { defender: Defender }>;
  canAttack: Interceptable<boolean, { target: AttackTarget }>;
  hasSummoningSickness: Interceptable<boolean, MinionCard>;
  canBeAttacked: Interceptable<boolean, { attacker: Attacker }>;
  canUseAbility: Interceptable<
    boolean,
    { card: MinionCard; ability: Ability<MinionCard> }
  >;
  canBeTargeted: Interceptable<boolean, { source: AnyCard }>;
  receivedDamage: Interceptable<number, { damage: Damage }>;
  maxHp: Interceptable<number, MinionCard>;
  atk: Interceptable<number, MinionCard>;
};
type MinionCardInterceptorName = keyof MinionCardInterceptors;

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

export class MinionCardDealCombatDamageEvent extends TypedSerializableEvent<
  {
    card: MinionCard;
    target: AttackTarget;
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
  { card: MinionCard; position: { zone: MinionSlotZone; slot: number } },
  { card: SerializedMinionCard; position: { zone: MinionSlotZone; slot: number } }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      position: this.data.position
    };
  }
}

export class MinionMoveEvent extends TypedSerializableEvent<
  { card: MinionCard; from: BoardMinionSlot; to: BoardMinionSlot },
  {
    card: SerializedMinionCard;
    from: SerializedBoardMinionSlot;
    to: SerializedBoardMinionSlot;
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
  [MINION_EVENTS.MINION_BEFORE_DEAL_COMBAT_DAMAGE]: MinionCardDealCombatDamageEvent;
  [MINION_EVENTS.MINION_AFTER_DEAL_COMBAT_DAMAGE]: MinionCardDealCombatDamageEvent;
  [MINION_EVENTS.MINION_BEFORE_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_AFTER_USE_ABILITY]: MinionUsedAbilityEvent;
  [MINION_EVENTS.MINION_SUMMONED]: MinionSummonedEvent;
  [MINION_EVENTS.MINION_BEFORE_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_AFTER_HEAL]: MinionCardHealEvent;
  [MINION_EVENTS.MINION_BEFORE_MOVE]: MinionMoveEvent;
  [MINION_EVENTS.MINION_AFTER_MOVE]: MinionMoveEvent;
};

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
        canBeCounterattacked: new Interceptable(),
        canAttack: new Interceptable(),
        hasSummoningSickness: new Interceptable(),
        canBeAttacked: new Interceptable(),
        canUseAbility: new Interceptable(),
        canBeTargeted: new Interceptable(),
        receivedDamage: new Interceptable(),
        maxHp: new Interceptable(),
        atk: new Interceptable()
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

  get minionSlot() {
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

  get slot() {
    if (!this.position) return null;
    return this.player.boardSide.getSlot(this.position.zone, this.position.slot);
  }

  get isAttacking() {
    const phaseCtx = this.game.gamePhaseSystem.getContext();
    return phaseCtx.state === GAME_PHASES.ATTACK && phaseCtx.ctx.attacker.equals(this);
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
    const base = !this._isExhausted && this.atk > 0 && target.canBeAttacked(this);

    return this.interceptors.canAttack.getValue(base, {
      target
    });
  }

  get canDealCombatDamage() {
    return true; // @TODO legacy shit, need to remove
  }

  canBeAttacked(attacker: AttackTarget) {
    return this.interceptors.canBeAttacked.getValue(true, {
      attacker
    });
  }

  canBeCounterattackedBy(defender: Defender) {
    return this.interceptors.canBeCounterattacked.getValue(true, {
      defender
    });
  }

  async moveTo(position: MinionPosition, allowSwap = false) {
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

  async useAbility(id: string) {
    const ability = this.abilities.find(ability => ability.abilityId === id);
    if (!ability) return;

    return await ability.use();
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

  canPlay() {
    return this.interceptors.canPlay.getValue(
      this.canPlayBase &&
        this.player.boardSide.hasUnoccupiedSlot &&
        this.blueprint.canPlay(this.game, this),
      this
    );
  }

  async playAt(position: MinionPosition) {
    await this.insertInChainOrExecute(async () => {
      if (this.player.boardSide.getSlot(position.zone, position.slot)!.isOccupied) {
        this.dispose();
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
    }, [position]);
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
  async play() {
    const position = await this.promptForSummonPosition();
    await this.game.emit(
      CARD_EVENTS.CARD_DECLARE_PLAY,
      new CardDeclarePlayEvent({ card: this })
    );
    await this.playAt(position);
  }

  get potentialAttackTargets() {
    if (this.location !== 'board') return [];
    return this.player.opponent.boardSide
      .getAllAttackTargets()
      .filter(target => this.canAttack(target));
  }

  serialize(): SerializedMinionCard {
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
      affinity: this.blueprint.affinity,
      position: this.position
        ? { zone: this.position.zone, slot: this.position.slot }
        : null,
      abilities: this.abilities.map(ability => ability.id)
    };
  }
}
