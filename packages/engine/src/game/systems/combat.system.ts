import {
  assert,
  isDefined,
  StateMachine,
  stateTransition,
  type MaybePromise,
  type Nullable,
  type Serializable,
  type Values
} from '@game/shared';
import { System } from '../../system';
import type { MinionCard } from '../../card/entities/minion.entity';
import { HeroCard } from '../../card/entities/hero.entity';
import {
  COMBAT_STEP_TRANSITIONS,
  COMBAT_STEPS,
  EFFECT_TYPE,
  type CombatStep,
  type CombatStepTransition
} from '../game.enums';
import { CorruptedGamephaseContextError, GameError } from '../game-error';
import { isHero } from '../../card/card-utils';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { CombatDamage } from '../../utils/damage';
import { nanoid } from 'nanoid';

export type Attacker = MinionCard;
export type AttackTarget = MinionCard;

export type SerializedCombatState = {
  attacker: string | null;
  defender: string | null;
  step: CombatStep;
  potentialTargets: string[];
};

export class CombatStateMachine extends StateMachine<CombatStep, CombatStepTransition> {
  constructor() {
    super(COMBAT_STEPS.DECLARE_ATTACKER);

    this.addTransitions([
      stateTransition(
        COMBAT_STEPS.DECLARE_ATTACKER,
        COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED,
        COMBAT_STEPS.DECLARE_TARGET
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_TARGET,
        COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED,
        COMBAT_STEPS.REACTION
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_TARGET,
        COMBAT_STEP_TRANSITIONS.CANCEL,
        COMBAT_STEPS.DECLARE_ATTACKER
      ),
      stateTransition(
        COMBAT_STEPS.REACTION,
        COMBAT_STEP_TRANSITIONS.RESOLVE_COMBAT,
        COMBAT_STEPS.RESOLVING_COMBAT
      ),
      stateTransition(
        COMBAT_STEPS.RESOLVING_COMBAT,
        COMBAT_STEP_TRANSITIONS.FINISHED,
        COMBAT_STEPS.DECLARE_ATTACKER
      )
    ]);
  }
}

export class CombatSystem
  extends System<never>
  implements Serializable<SerializedCombatState>
{
  private _attacker: Attacker | null = null;
  private _defender: AttackTarget | null = null;
  isDefenderRetaliating = false;

  private stateMachine = new CombatStateMachine();

  initialize(): MaybePromise<void> {}
  shutdown() {}

  get attacker() {
    return this._attacker;
  }

  get defender() {
    return this._defender;
  }

  get state() {
    return this.stateMachine.getState();
  }

  get potentialTargets(): Nullable<AttackTarget[]> {
    return this.attacker?.potentialAttackTargets;
  }

  get isCombatOngoing() {
    return this.stateMachine.getState() !== COMBAT_STEPS.DECLARE_ATTACKER;
  }

  async declareAttacker(attacker: Attacker) {
    assert(
      this.stateMachine.can(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK,
      new BeforeDeclareAttackEvent({ attacker })
    );

    this._attacker = attacker;

    this.stateMachine.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED);

    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK,
      new AfterDeclareAttackEvent({ attacker })
    );
  }

  async declareAttackTarget(target: AttackTarget) {
    assert(
      this.stateMachine.can(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED),
      new WrongCombatStepError()
    );
    assert(isDefined(this.attacker), new CorruptedGamephaseContextError());

    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET,
      new BeforeDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    this._defender = target;
    await this.attacker.exhaust();

    this.stateMachine.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
      new AfterDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    if (!this.attacker.getShouldCreateChainOnAttack(this.defender!)) {
      await this.resolveCombat();
      return;
    }

    if (!this.game.effectChainSystem.currentChain) {
      await this.game.effectChainSystem.createChain({
        initialPlayer: this.attacker.player.opponent,
        onResolved: async () => this.resolveCombat()
      });

      await this.game.inputSystem.askForPlayerInput();
    } else {
      await this.resolveCombat();
    }
  }

  async declareRetaliation() {
    if (!this.defender) {
      throw new WrongCombatStepError();
    }
    if (
      !this.attacker!.canBeRetaliatedBy(this.defender) ||
      !this.defender.canRetaliate(this.attacker!)
    ) {
      throw new InvalidCounterattackError();
    }
    await this.defender.exhaust();
    this.isDefenderRetaliating = true;
    await this.game.effectChainSystem.currentChain?.addEffect(
      {
        id: nanoid(),
        source: this.defender,
        type: EFFECT_TYPE.RETALIATION,
        targets: { cards: [this.attacker!], spaces: [] },
        handler: async () => {}
      },
      this.defender.player
    );
  }

  changeTarget(newTarget: AttackTarget) {
    if (!this.defender) return;
    this._defender = newTarget;
  }

  changeAttacker(newAttacker: Attacker) {
    if (!this.attacker) return;
    this._attacker = newAttacker;
  }

  private async resolveCombat() {
    assert(isDefined(this.defender), new CorruptedGamephaseContextError());
    assert(isDefined(this.attacker), new CorruptedGamephaseContextError());

    this.stateMachine.dispatch(COMBAT_STEP_TRANSITIONS.RESOLVE_COMBAT);

    if (!this.attacker.canResolveCombat || !this.defender.canResolveCombat) {
      await this.game.emit(
        COMBAT_EVENTS.ATTACK_FIZZLED,
        new AttackFizzledResolveCombatEvent({
          attacker: this.attacker,
          target: this.defender
        })
      );
    } else {
      await this.game.emit(
        COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT,
        new BeforeResolveCombatEvent({
          attacker: this.attacker!,
          target: this.defender!
        })
      );

      await this.performAttacks();

      await this.game.emit(
        COMBAT_EVENTS.AFTER_RESOLVE_COMBAT,
        new AfterResolveCombatEvent({
          attacker: this.attacker!,
          target: this.defender!
        })
      );

      this.stateMachine.dispatch(COMBAT_STEP_TRANSITIONS.FINISHED);
    }

    if (this.attacker!.shouldSwitchInitiativeAfterAttacking(this.defender!)) {
      await this.game.turnSystem.switchInitiative();
    }
    this._attacker = null;
    this._defender = null;
  }

  private async performAttacks() {
    const defender = this.defender;
    const attacker = this.attacker;
    if (!attacker || !defender) return;

    const canResolve = defender.isAlive && attacker.isAlive;
    if (canResolve) {
      const attackerDealsFirst = attacker.shouldDealDamageFirst;
      const defenderDealsFirst = defender.shouldDealDamageFirst;

      const performAtttackerStrike = async () => {
        if (defender.isAlive) {
          await attacker.dealDamage(defender, new CombatDamage(attacker));
        }
      };

      const performDefenderStrike = async () => {
        if (!this.isDefenderRetaliating) return;
        if (attacker.isAlive) {
          await defender.dealDamage(attacker, new CombatDamage(defender));
        }
      };

      if (attackerDealsFirst && !defenderDealsFirst) {
        await performAtttackerStrike();
        if (defender.isAlive) {
          await performDefenderStrike();
        }
      } else if (!attackerDealsFirst && defenderDealsFirst) {
        await performDefenderStrike();
        if (defender.isAlive) {
          await performAtttackerStrike();
        }
      } else {
        await performAtttackerStrike();
        await performDefenderStrike();
      }
    }

    await this.game.emit(
      COMBAT_EVENTS.AFTER_RESOLVE_COMBAT,
      new AfterResolveCombatEvent({
        attacker: attacker,
        target: defender
      })
    );
  }

  serialize() {
    return {
      attacker: this.attacker?.id ?? null,
      defender: this.defender?.id ?? null,
      step: this.stateMachine.getState(),
      potentialTargets: this.potentialTargets?.map(target => target.id) ?? []
    };
  }
}

export class WrongCombatStepError extends GameError {
  constructor() {
    super('Wrong combat step');
  }
}

export class InvalidCounterattackError extends GameError {
  constructor() {
    super('This unit cannot counterattack this target');
  }
}

export class BeforeDeclareAttackEvent extends TypedSerializableEvent<
  { attacker: Attacker },
  { attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id
    };
  }
}

export class AfterDeclareAttackEvent extends TypedSerializableEvent<
  { attacker: Attacker },
  { attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id
    };
  }
}

export class BeforeDeclareAttackTargetEvent extends TypedSerializableEvent<
  { target: AttackTarget; attacker: Attacker },
  { target: string; attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class AfterDeclareAttackTargetEvent extends TypedSerializableEvent<
  { target: AttackTarget; attacker: Attacker },
  { target: string; attacker: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class BeforeResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget },
  { attacker: string; target: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class AfterResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget },
  { attacker: string; target: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export class AttackFizzledResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget },
  { attacker: string; target: string }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id
    };
  }
}

export const COMBAT_EVENTS = {
  BEFORE_DECLARE_ATTACK: 'combat.before-declare-attack',
  AFTER_DECLARE_ATTACK: 'combat.after-declare-attack',
  BEFORE_DECLARE_ATTACK_TARGET: 'combat.before-declare-attack-target',
  AFTER_DECLARE_ATTACK_TARGET: 'combat.after-declare-attack-target',
  BEFORE_RESOLVE_COMBAT: 'combat.before-resolve-combat',
  AFTER_RESOLVE_COMBAT: 'combat.after-resolve-combat',
  ATTACK_FIZZLED: 'combat.attack-fizzled'
} as const;
export type CombatEventName = Values<typeof COMBAT_EVENTS>;

export type CombatEventMap = {
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK]: BeforeDeclareAttackEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK]: AfterDeclareAttackEvent;
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET]: BeforeDeclareAttackTargetEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET]: AfterDeclareAttackTargetEvent;
  [COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT]: BeforeResolveCombatEvent;
  [COMBAT_EVENTS.AFTER_RESOLVE_COMBAT]: AfterResolveCombatEvent;
  [COMBAT_EVENTS.ATTACK_FIZZLED]: AttackFizzledResolveCombatEvent;
};
