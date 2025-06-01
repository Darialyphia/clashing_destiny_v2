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
import type { MinionCard } from '../../card/entities/minion.card';
import { GameError } from '../game-error';
import { GAME_PHASE_TRANSITIONS } from '../systems/game-phase.system';
import { CombatDamage } from '../../utils/damage';
import { TypedSerializableEvent } from '../../utils/typed-emitter';

export type Attacker = MinionCard | HeroCard;
export type AttackTarget = MinionCard | HeroCard;
export type Defender = MinionCard | HeroCard;

export const COMBAT_STEPS = {
  DECLARE_ATTACKER: 'declare-attacker',
  DECLARE_BLOCKER: 'declare-blocker',
  BUILDING_CHAIN: 'chain',
  RESOLVING_COMBAT: 'resolving'
} as const;

export type CombatStep = Values<typeof COMBAT_STEPS>;

export const COMBAT_STEP_TRANSITIONS = {
  ATTACKER_DECLARED: 'attacker-declared',
  BLOCKER_DECLARED: 'blocker-declared',
  CHAIN_RESOLVED: 'chain-resolved'
} as const;

export type CombatStepTransition = Values<typeof COMBAT_STEP_TRANSITIONS>;

export type SerializedCombatPhase = {
  attacker: string;
  target: string;
  blocker: string | null;
  step: CombatStep;
  potentialBlockers: string[];
};

export class BeforeDeclareAttackEvent extends TypedSerializableEvent<
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

export class AfterDeclareAttackEvent extends TypedSerializableEvent<
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

export class BeforeDeclareBlockerEvent extends TypedSerializableEvent<
  { blocker: Defender | null },
  { blocker: string | null }
> {
  serialize() {
    return {
      blocker: this.data.blocker?.id ?? null
    };
  }
}
export class AfterDeclareBlockerEvent extends TypedSerializableEvent<
  { blocker: Defender | null },
  { blocker: string | null }
> {
  serialize() {
    return {
      blocker: this.data.blocker?.id ?? null
    };
  }
}

export class BeforeResolveCombatEvent extends TypedSerializableEvent<
  { attacker: Attacker; target: AttackTarget; blocker: Defender | null },
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
  { attacker: Attacker; target: AttackTarget; blocker: Defender | null },
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

export const COMBAT_EVENTS = {
  BEFORE_DECLARE_ATTACK: 'combat.before-declare-attack',
  AFTER_DECLARE_ATTACK: 'combat.after-declare-attack',
  BEFORE_DECLARE_BLOCKER: 'combat.before-declare-blocker',
  AFTER_DECLARE_BLOCKER: 'combat.after-declare-blocker',
  BEFORE_RESOLVE_COMBAT: 'combat.before-resolve-combat',
  AFTER_RESOLVE_COMBAT: 'combat.after-resolve-combat'
} as const;
export type CombatEventName = Values<typeof COMBAT_EVENTS>;

export type CombatEventMap = {
  [COMBAT_EVENTS.BEFORE_DECLARE_ATTACK]: BeforeDeclareAttackEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_ATTACK]: AfterDeclareAttackEvent;
  [COMBAT_EVENTS.BEFORE_DECLARE_BLOCKER]: BeforeDeclareBlockerEvent;
  [COMBAT_EVENTS.AFTER_DECLARE_BLOCKER]: AfterDeclareBlockerEvent;
  [COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT]: BeforeResolveCombatEvent;
  [COMBAT_EVENTS.AFTER_RESOLVE_COMBAT]: AfterResolveCombatEvent;
};

export class CombatPhase
  extends StateMachine<CombatStep, CombatStepTransition>
  implements GamePhaseController, Serializable<SerializedCombatPhase>
{
  attacker!: Attacker;
  target!: AttackTarget;
  blocker: Defender | null = null;

  constructor(private game: Game) {
    super(COMBAT_STEPS.DECLARE_ATTACKER);

    this.addTransitions([
      stateTransition(
        COMBAT_STEPS.DECLARE_ATTACKER,
        COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED,
        COMBAT_STEPS.DECLARE_BLOCKER
      ),
      stateTransition(
        COMBAT_STEPS.DECLARE_BLOCKER,
        COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED,
        COMBAT_STEPS.BUILDING_CHAIN
      ),
      stateTransition(
        COMBAT_STEPS.BUILDING_CHAIN,
        COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED,
        COMBAT_STEPS.RESOLVING_COMBAT
      )
    ]);
  }

  get potentialBlockers(): Defender[] {
    return this.target.player.minions.filter(minion => this.canBlock(minion));
  }

  async declareAttacker({
    attacker,
    target
  }: {
    attacker: Attacker;
    target: AttackTarget;
  }) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_ATTACK,
      new BeforeDeclareAttackEvent({ attacker, target })
    );

    this.attacker = attacker;
    this.target = target;

    await this.attacker.exhaust();

    this.dispatch(COMBAT_STEP_TRANSITIONS.ATTACKER_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_ATTACK,
      new AfterDeclareAttackEvent({ attacker, target })
    );

    await this.game.inputSystem.askForPlayerInput();
  }

  async declareBlocker(blocker: Defender | null) {
    assert(
      this.can(COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED),
      new WrongCombatStepError()
    );
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_DECLARE_BLOCKER,
      new BeforeDeclareBlockerEvent({ blocker })
    );
    this.blocker = blocker;
    this.dispatch(COMBAT_STEP_TRANSITIONS.BLOCKER_DECLARED);
    await this.game.emit(
      COMBAT_EVENTS.AFTER_DECLARE_BLOCKER,
      new AfterDeclareBlockerEvent({ blocker })
    );
    await this.game.effectChainSystem.createChain(this.attacker.player.opponent);
    await this.resolveCombat();
  }

  private async resolveCombat() {
    this.dispatch(COMBAT_STEP_TRANSITIONS.CHAIN_RESOLVED);
    await this.game.emit(
      COMBAT_EVENTS.BEFORE_RESOLVE_COMBAT,
      new BeforeResolveCombatEvent({
        attacker: this.attacker,
        target: this.target,
        blocker: this.blocker
      })
    );
    const defender = this.blocker ?? this.target;
    await defender.takeDamage(this.attacker, new CombatDamage(this.attacker));
    await this.attacker.takeDamage(defender, new CombatDamage(defender));

    await this.game.emit(
      COMBAT_EVENTS.AFTER_RESOLVE_COMBAT,
      new AfterResolveCombatEvent({
        attacker: this.attacker,
        target: this.target,
        blocker: this.blocker
      })
    );
    this.game.interaction.onInteractionEnd();
    await this.game.gamePhaseSystem.sendTransition(GAME_PHASE_TRANSITIONS.FINISH_ATTACK);
  }

  canBlock(blocker: Defender) {
    return (
      this.attacker.canBeBlocked(blocker) &&
      blocker.canBlock(this.attacker) &&
      this.target.canBeDefendedBy(blocker)
    );
  }

  async onEnter() {}

  async onExit() {}

  serialize(): SerializedCombatPhase {
    return {
      attacker: this.attacker.id,
      target: this.target.id,
      blocker: this.blocker?.id ?? null,
      step: this.getState(),
      potentialBlockers: this.potentialBlockers.map(b => b.id)
    };
  }
}

export class WrongCombatStepError extends GameError {
  constructor() {
    super('Wrong combat step');
  }
}
