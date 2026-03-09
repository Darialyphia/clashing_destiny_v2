import {
  assert,
  isDefined,
  StateMachine,
  stateTransition,
  type Nullable,
  type Serializable,
  type Values
} from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { CorruptedGamephaseContextError, GameError } from '../game-error';
import { CombatDamage } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import {
  COMBAT_STEP_TRANSITIONS,
  COMBAT_STEPS,
  GAME_PHASE_TRANSITIONS,
  type CombatStep,
  type CombatStepTransition
} from '../game.enums';

export type Attacker = MinionCard | HeroCard;
export type AttackTarget = MinionCard | HeroCard;

export type SerializedCombatPhase = {
  attacker: string | null;
  target: string | null;
  step: CombatStep;
  potentialTargets: string[];
};

export class CombatPhase
  extends StateMachine<CombatStep, CombatStepTransition>
  implements GamePhaseController, Serializable<SerializedCombatPhase>
{
  attacker: Attacker | null = null;
  defender: AttackTarget | null = null;

  constructor(private game: Game) {
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
        COMBAT_STEPS.RESOLVING_COMBAT
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_TARGET,
        COMBAT_STEP_TRANSITIONS.CANCEL,
        COMBAT_STEPS.DECLARE_ATTACKER
      ),
      stateTransition(
        COMBAT_STEPS.RESOLVING_COMBAT,
        COMBAT_STEP_TRANSITIONS.FINISHED,
        COMBAT_STEPS.DECLARE_ATTACKER
      )
    ]);
  }

  get potentialTargets(): Nullable<AttackTarget[]> {
    return this.attacker?.potentialAttackTargets;
  }

  async declareAttacker(attacker: Attacker) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK,
      new BeforeDeclareAttackEvent({ attacker })
    );

    this.attacker = attacker;

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK,
      new AfterDeclareAttackEvent({ attacker })
    );
  }

  async declareAttackTarget(target: AttackTarget) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED),
      new WrongCombatStepError()
    );
    assert(isDefined(this.attacker), new CorruptedGamephaseContextError());

    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET,
      new BeforeDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    this.defender = target;
    await this.attacker.exhaust();

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
      new AfterDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    await this.resolveCombat();
  }

  changeTarget(newTarget: AttackTarget) {
    if (!this.defender) return;
    this.defender = newTarget;
  }

  changeAttacker(newAttacker: Attacker) {
    if (!this.attacker) return;
    this.attacker = newAttacker;
  }

  private async resolveCombat() {
    assert(isDefined(this.defender), new CorruptedGamephaseContextError());
    assert(isDefined(this.attacker), new CorruptedGamephaseContextError());

    await this.game.emit(
      COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT,
      new BeforeResolveCombatEvent({
        attacker: this.attacker,
        target: this.defender
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

    this.dispatch(COMBAT_STEP_TRANSITIONS.FINISHED);
  }

  private async performAttacks() {
    const defender = this.defender;
    const attacker = this.attacker;
    if (!defender || !attacker) return;

    const canResolve = defender.isAlive && attacker.isAlive;
    if (canResolve) {
      const attackerFirst = attacker.dealsDamageFirst;
      const defenderFirst = defender.dealsDamageFirst;

      const performAtttackerStrike = async () => {
        if (defender.isAlive) {
          await attacker.dealDamage(defender, new CombatDamage(attacker));
        }
      };

      const performDefenderStrike = async () => {
        if (!attacker.isAlive) return;

        const shouldStrikeBack =
          defender.canRetaliate(attacker) && attacker.canBeRetaliatedBy(defender);
        if (!shouldStrikeBack) return;

        await defender.dealDamage(attacker, new CombatDamage(defender));
      };

      if (attackerFirst && !defenderFirst) {
        await performAtttackerStrike();
        if (defender.isAlive) {
          await performDefenderStrike();
        }
      } else if (!attackerFirst && defenderFirst) {
        await performDefenderStrike();
        if (attacker.isAlive) {
          await performAtttackerStrike();
        }
      } else {
        await performAtttackerStrike();
        await performDefenderStrike();
      }
    }
  }

  private async end() {
    this.game.interaction.onInteractionEnd();
    await this.game.gamePhaseSystem.sendTransition(
      GAME_PHASE_TRANSITIONS.END_COMBAT_PHASE
    );
    await this.game.inputSystem.askForPlayerInput();
  }

  async cancelAttack() {
    assert(this.can(COMBAT_STEP_TRANSITIONS.CANCEL), new WrongCombatStepError());
    this.attacker = null;
    this.defender = null;
    this.dispatch(COMBAT_STEP_TRANSITIONS.CANCEL);
  }

  get step() {
    return this.getState();
  }

  async onEnter() {}

  async onExit() {}

  serialize(): SerializedCombatPhase {
    return {
      attacker: this.attacker?.id ?? null,
      target: this.defender?.id ?? null,
      step: this.getState(),
      potentialTargets: this.potentialTargets?.map(t => t.id) ?? []
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
