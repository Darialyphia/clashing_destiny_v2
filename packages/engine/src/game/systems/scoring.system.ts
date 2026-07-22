import {
  assert,
  StateMachine,
  stateTransition,
  type MaybePromise,
  type Serializable
} from '@game/shared';
import { System } from '../../system';
import type { MinionCard } from '../../card/entities/minion.entity';
import {
  SCORING_STEP_TRANSITIONS,
  SCORING_STEPS,
  type ScoringStep,
  type ScoringStepTransition
} from '../game.enums';
import { GameError } from '../game-error';
import { CARD_EVENTS } from '../../card/card.enums';
import { CardScoreEvent } from '../../card/card.events';

export type Attacker = MinionCard;
export type AttackTarget = MinionCard;

export type SerializedScoringState = {
  step: ScoringStep;
  scoringCard: string | null;
  scoredDestiny: string | null;
};

export class ScoringStateMachine extends StateMachine<
  ScoringStep,
  ScoringStepTransition
> {
  constructor() {
    super(SCORING_STEPS.DECLARE_SCORING);

    this.addTransitions([
      stateTransition(
        SCORING_STEPS.DECLARE_SCORING,
        SCORING_STEP_TRANSITIONS.SCORING_DECLARED,
        SCORING_STEPS.REACTION
      ),
      stateTransition(
        SCORING_STEPS.REACTION,
        SCORING_STEP_TRANSITIONS.RESOLVE_SCORING,
        SCORING_STEPS.RESOLVING_SCORING
      ),
      stateTransition(
        SCORING_STEPS.RESOLVING_SCORING,
        SCORING_STEP_TRANSITIONS.FINISHED,
        SCORING_STEPS.DECLARE_SCORING
      ),
      stateTransition(
        SCORING_STEPS.DECLARE_SCORING,
        SCORING_STEP_TRANSITIONS.ABORT_SCORING,
        SCORING_STEPS.DECLARE_SCORING
      )
    ]);
  }
}

export class ScoringSystem
  extends System<never>
  implements Serializable<SerializedScoringState>
{
  private _scoringCard: MinionCard | null = null;

  private stateMachine = new ScoringStateMachine();

  initialize(): MaybePromise<void> {}
  shutdown() {}

  get scoringCard() {
    return this._scoringCard;
  }

  get state() {
    return this.stateMachine.getState();
  }

  async declareScoring(scoringCard: MinionCard) {
    assert(
      this.stateMachine.can(SCORING_STEP_TRANSITIONS.SCORING_DECLARED),
      new WrongScoringStepError()
    );

    this._scoringCard = scoringCard;
    await this._scoringCard.exhaust();

    await this.game.emit(
      CARD_EVENTS.BEFORE_SCORE,
      new CardScoreEvent({
        card: this._scoringCard,
        battlefield: this._scoringCard!.battlefield!
      })
    );

    this.stateMachine.dispatch(SCORING_STEP_TRANSITIONS.SCORING_DECLARED);

    await this.game.effectChainSystem.createChain({
      initialPlayer: this.scoringCard!.player.opponent,
      onResolved: async () => this.resolveScoring()
    });
  }

  private async resolveScoring() {
    this.stateMachine.dispatch(SCORING_STEP_TRANSITIONS.RESOLVE_SCORING);

    if (this._scoringCard?.isOnBattlefield) {
      await this._scoringCard.battlefield?.gainScore(this._scoringCard.commandment);

      await this.game.emit(
        CARD_EVENTS.AFTER_SCORE,
        new CardScoreEvent({
          card: this._scoringCard!,
          battlefield: this._scoringCard!.battlefield!
        })
      );
    }

    if (this._scoringCard!.shouldSwitchInitiativeAfterScoring) {
      await this.game.turnSystem.switchInitiative();
    }

    this._scoringCard = null;
    this.stateMachine.dispatch(SCORING_STEP_TRANSITIONS.FINISHED);
  }

  serialize() {
    return {
      step: this.stateMachine.getState(),
      scoringCard: this._scoringCard?.id ?? null,
      scoredDestiny: this._scoringCard?.battlefield?.destinyCard?.id ?? null
    };
  }
}

export class WrongScoringStepError extends GameError {
  constructor() {
    super('Wrong scoring step');
  }
}
