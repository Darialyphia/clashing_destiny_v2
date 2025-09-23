import {
  assert,
  StateMachine,
  stateTransition,
  type Serializable,
  type Values
} from '@game/shared';
import type { Game } from '../game';
import type { GamePhaseController } from './game-phase';
import type { HeroCard } from '../../card/entities/hero.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import { GameError } from '../game-error';
import {
  CorruptedGamephaseContextError,
  GAME_PHASE_TRANSITIONS
} from '../systems/game-phase.system';
import { CombatDamage } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES } from '../game.enums';

export type Attacker = MinionCard | HeroCard;
export type AttackTarget = MinionCard | HeroCard;
export type Defender = MinionCard | HeroCard;

export const COMBAT_STEPS = {
  DECLARE_ATTACKER: 'declare-attacker',
  DECLARE_TARGET: 'declare-target',
  BUILDING_CHAIN: 'chain',
  RESOLVING_COMBAT: 'resolving'
} as const;

export type CombatStep = Values<typeof COMBAT_STEPS>;

export const COMBAT_STEP_TRANSITIONS = {
  ATTACKER_DECLARED: 'attacker-declared',
  ATTACKER_TARGET_DECLARED: 'attacker-target-declared',
  CHAIN_RESOLVED: 'chain-resolved'
} as const;

export type CombatStepTransition = Values<typeof COMBAT_STEP_TRANSITIONS>;

export type SerializedCombatPhase = {
  attacker: string;
  target: string | null;
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

export const COMBAT_EVENTS = {
  BEFORE_DECLARE_ATTACK: 'combat.before-declare-attack',
  AFTER_DECLARE_ATTACK: 'combat.after-declare-attack',
  BEFORE_DECLARE_ATTACK_TARGET: 'combat.before-declare-attack-target',
  AFTER_DECLARE_ATTACK_TARGET: 'combat.after-declare-attack-target',
  BEFORE_RESOLVE_COMBAT: 'combat.before-resolve-combat',
  AFTER_RESOLVE_COMBAT: 'combat.after-resolve-combat'
} as const;
export type CombatEventName = Values<typeof COMBAT_EVENTS>;

export type CombatEventMap = {
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK]: BeforeDeclareAttackEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK]: AfterDeclareAttackEvent;
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK_TARGET]: BeforeDeclareAttackTargetEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK_TARGET]: AfterDeclareAttackTargetEvent;
  [COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT]: BeforeResolveCombatEvent;
  [COMBAT_EVENTS.AFTER_RESOLVE_COMBAT]: AfterResolveCombatEvent;
};

export class CombatPhase
  extends StateMachine<CombatStep, CombatStepTransition>
  implements GamePhaseController, Serializable<SerializedCombatPhase>
{
  attacker!: Attacker;
  target: AttackTarget | null = null;

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
        initialPlayer: this.attacker.player,
        onResolved: async () => this.resolveCombat()
      });

      await this.game.inputSystem.askForPlayerInput();
    } else {
      await this.resolveCombat();
    }
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
        target: this.target
      })
    );

    const isCancelled = this.isCancelled || !this.attacker.canDealCombatDamage;
    if (!isCancelled) {
      await this.performAttacks();
    }

    await this.end();
  }

  private async performAttacks() {
    if (!this.target) return;

    if (this.target.isAlive && this.attacker.isAlive) {
      await this.attacker.dealDamage(this.target, new CombatDamage(this.attacker));
      if (this.attacker.canBeCounterattackedBy(this.target)) {
        await this.target.dealDamage(this.attacker, new CombatDamage(this.target));
      }
    }

    await this.game.emit(
      COMBAT_EVENTS.AFTER_RESOLVE_COMBAT,
      new AfterResolveCombatEvent({
        attacker: this.attacker,
        target: this.target!
      })
    );
  }

  private async end() {
    this.game.interaction.onInteractionEnd();
    // phase can be different if combat was aborted early, eg. Elusive
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
      step: this.getState(),
      potentialTargets: this.potentialTargets.map(t => t.id)
    };
  }
}

export class WrongCombatStepError extends GameError {
  constructor() {
    super('Wrong combat step');
  }
}
