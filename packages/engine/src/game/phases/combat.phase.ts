import {
  assert,
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
  COMBAT_STEPS,
  EFFECT_TYPE,
  GAME_PHASE_TRANSITIONS,
  GAME_PHASES,
  type CombatStep
} from '../game.enums';

export type Attacker = MinionCard | HeroCard;
export type AttackTarget = MinionCard | HeroCard;

export const COMBAT_STEP_TRANSITIONS = {
  ATTACKER_DECLARED: 'attacker-declared',
  ATTACKER_TARGET_DECLARED: 'attacker-target-declared',
  CHAIN_RESOLVED: 'chain-resolved'
} as const;

export type CombatStepTransition = Values<typeof COMBAT_STEP_TRANSITIONS>;

export type SerializedCombatPhase = {
  attacker: string;
  target: string | null;
  blocker: string | null;
  isTargetRetaliating: boolean;
  step: CombatStep;
  potentialTargets: string[];
};

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
  { attacker: Attacker; target: AttackTarget; blocker: Nullable<AttackTarget> },
  { attacker: string; target: string; blocker: string | null }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id,
      blocker: this.data.blocker?.id ?? null
    };
  }
}

export class AfterResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget; blocker: Nullable<AttackTarget> },
  { attacker: string; target: string; blocker: string | null }
> {
  serialize() {
    return {
      attacker: this.data.attacker.id,
      target: this.data.target.id,
      blocker: this.data.blocker?.id ?? null
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

export class CombatPhase
  extends StateMachine<CombatStep, CombatStepTransition>
  implements GamePhaseController, Serializable<SerializedCombatPhase>
{
  attacker!: Attacker;
  target: AttackTarget | null = null;
  blocker: AttackTarget | null = null;
  isTargetRetaliating = false;

  private isCancelled = false;

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
        COMBAT_STEPS.BUILDING_CHAIN
      ),
      stateTransition(
        COMBAT_STEPS.BUILDING_CHAIN,
        COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED,
        COMBAT_STEPS.RESOLVING_COMBAT
      )
    ]);
  }

  get potentialTargets(): AttackTarget[] {
    return this.attacker.potentialAttackTargets;
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

    await this.game.inputSystem.askForPlayerInput();
  }

  async declareAttackTarget(target: AttackTarget) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET,
      new BeforeDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    this.target = target;
    await this.attacker.exhaust();

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_TARGET_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET,
      new AfterDeclareAttackTargetEvent({ target, attacker: this.attacker })
    );

    if (!this.game.effectChainSystem.currentChain) {
      void this.game.effectChainSystem.createChain({
        initialPlayer: this.attacker.player.opponent,
        onResolved: async () => this.resolveCombat()
      });

      await this.game.inputSystem.askForPlayerInput();
    } else {
      await this.resolveCombat();
    }
  }

  async declareBlocker(blocker: AttackTarget) {
    if (this.getState() !== COMBAT_STEPS.BUILDING_CHAIN) {
      throw new WrongCombatStepError();
    }
    this.blocker = blocker;
    await blocker.exhaust();

    await this.game.effectChainSystem.currentChain?.addEffect(
      {
        source: blocker,
        type: EFFECT_TYPE.DECLARE_BLOCKER,
        targets: [this.attacker],
        handler: async () => {}
      },
      blocker.player
    );
  }

  async declareRetaliation() {
    if (!this.target) {
      throw new WrongCombatStepError();
    }
    if (
      !this.attacker.canBeRetaliatedBy(this.target) ||
      !this.target.canRetaliate(this.attacker)
    ) {
      throw new InvalidCounterattackError();
    }
    await this.target.exhaust();
    this.isTargetRetaliating = true; // mark the retaliation immediately so it can be displayed inthe UI
    await this.game.effectChainSystem.currentChain?.addEffect(
      {
        source: this.target,
        type: EFFECT_TYPE.RETALIATION,
        targets: [this.attacker],
        handler: async () => {}
      },
      this.target.player
    );
  }

  changeTarget(newTarget: AttackTarget) {
    if (!this.target) return;
    this.target = newTarget;
  }

  changeAttacker(newAttacker: Attacker) {
    if (!this.attacker) return;
    this.attacker = newAttacker;
  }

  private async resolveCombat() {
    assert(this.target, new CorruptedGamephaseContextError());

    this.dispatch(COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED);

    await this.game.emit(
      COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT,
      new BeforeResolveCombatEvent({
        attacker: this.attacker,
        target: this.target,
        blocker: this.blocker
      })
    );

    if (!this.isCancelled) {
      await this.performAttacks();
    }

    await this.end();
  }

  private async performAttacks() {
    const defender = this.blocker ?? this.target;
    if (!defender) return;

    const canResolve = defender.isAlive && this.attacker.isAlive;
    if (canResolve) {
      const attackerDealsFirst = this.attacker.dealsDamageFirst;
      const defenderDealsFirst = defender.dealsDamageFirst;

      const performAtttackerStrike = async () => {
        if (defender.isAlive) {
          await this.attacker.dealDamage(defender, new CombatDamage(this.attacker));
        }
      };

      const performDefenderStrike = async () => {
        const shouldStrike = this.blocker?.equals(defender)
          ? true
          : this.isTargetRetaliating;
        if (!shouldStrike) return;
        if (this.attacker.isAlive) {
          await defender.dealDamage(this.attacker, new CombatDamage(defender));
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
        attacker: this.attacker,
        target: this.target!,
        blocker: this.blocker
      })
    );
  }

  private async end() {
    this.game.interaction.onInteractionEnd();
    // phase can be different if combat was aborted early
    if (this.game.gamePhaseSystem.getState() === GAME_PHASES.ATTACK) {
      await this.game.gamePhaseSystem.sendTransition(
        GAME_PHASE_TRANSITIONS.FINISH_ATTACK
      );
    }
    await this.game.inputSystem.askForPlayerInput();
  }

  async cancelAttack() {
    if (this.isCancelled) return;
    this.isCancelled = true;
    await this.end();
  }

  get step() {
    return this.getState();
  }

  async onEnter() {}

  async onExit() {}

  serialize(): SerializedCombatPhase {
    return {
      attacker: this.attacker.id,
      target: this.target?.id ?? null,
      blocker: this.blocker?.id ?? null,
      step: this.getState(),
      potentialTargets: this.potentialTargets.map(t => t.id),
      isTargetRetaliating: this.isTargetRetaliating
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
