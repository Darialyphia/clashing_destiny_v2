import {
  type EmptyObject,
  type Serializable,
  type Values,
  assert,
  StateMachine,
  stateTransition
} from '@game/shared';

import type { Game } from '../game';
import type { AnyCard } from '../../card/entities/card.entity';
import { GameError } from '../game-error';
import type { Player } from '../../player/player.entity';
import { SelectingCardOnBoardContext } from '../interactions/selecting-cards-on-board.interaction';
import {
  SelectingMinionSlotsContext,
  type MinionPosition
} from '../interactions/selecting-minion-slots.interaction';
import { ChoosingCardsContext } from '../interactions/choosing-cards.interaction';
import { IdleContext } from '../interactions/idle.interaction';
import { ChoosingAffinityContext } from '../interactions/choosing-affinity.interaction';
import type { Affinity } from '../../card/card.enums';

export const INTERACTION_STATES = {
  IDLE: 'idle',
  SELECTING_CARDS_ON_BOARD: 'selecting_cards_on_board',
  CHOOSING_CARDS: 'choosing_cards',
  SELECTING_MINION_SLOT: 'selecting_minion_slot',
  CHOOSING_AFFINITY: 'choosing_affinity'
} as const;
export type InteractionStateDict = typeof INTERACTION_STATES;
export type InteractionState = Values<typeof INTERACTION_STATES>;

export const INTERACTION_STATE_TRANSITIONS = {
  START_SELECTING_CARDS_ON_BOARD: 'start_selecting_cards_on_board',
  COMMIT_SELECTING_CARDS_ON_BOARD: 'commit_selecting_cards_on_board',
  START_SELECTING_MINION_SLOT: 'start_selecting_minion_slot',
  COMMIT_SELECTING_MINION_SLOT: 'commit_selecting_minion_slot',
  START_CHOOSING_CARDS: 'start_choosing_cards',
  COMMIT_CHOOSING_CARDS: 'commit_choosing_cards',
  START_CHOOSING_AFFINITY: 'start_choosing_affinity',
  COMMIT_CHOOSING_AFFINITY: 'commit_choosing_affinity'
};
export type InteractionStateTransition = Values<typeof INTERACTION_STATE_TRANSITIONS>;

export type InteractionContext =
  | {
      state: Extract<InteractionState, 'idle'>;
      ctx: IdleContext;
    }
  | {
      state: Extract<InteractionState, 'selecting_cards_on_board'>;
      ctx: SelectingCardOnBoardContext;
    }
  | {
      state: Extract<InteractionState, 'selecting_minion_slot'>;
      ctx: SelectingMinionSlotsContext;
    }
  | {
      state: Extract<InteractionState, 'choosing_cards'>;
      ctx: ChoosingCardsContext;
    }
  | {
      state: Extract<InteractionState, 'choosing_affinity'>;
      ctx: ChoosingAffinityContext;
    };

export type SerializedInteractionContext =
  | {
      state: Extract<InteractionState, 'idle'>;
      ctx: EmptyObject;
    }
  | {
      state: Extract<InteractionState, 'selecting_cards_on_board'>;
      ctx: ReturnType<SelectingCardOnBoardContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'selecting_minion_slot'>;
      ctx: ReturnType<SelectingMinionSlotsContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'choosing_cards'>;
      ctx: ReturnType<ChoosingCardsContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'choosing_affinity'>;
      ctx: ReturnType<ChoosingAffinityContext['serialize']>;
    };

export class GameInteractionSystem
  extends StateMachine<InteractionState, InteractionStateTransition>
  implements Serializable<SerializedInteractionContext>
{
  private ctxDictionary = {
    [INTERACTION_STATES.IDLE]: IdleContext,
    [INTERACTION_STATES.SELECTING_CARDS_ON_BOARD]: SelectingCardOnBoardContext,
    [INTERACTION_STATES.SELECTING_MINION_SLOT]: SelectingMinionSlotsContext,
    [INTERACTION_STATES.CHOOSING_CARDS]: ChoosingCardsContext,
    [INTERACTION_STATES.CHOOSING_AFFINITY]: ChoosingAffinityContext
  } as const;

  private _ctx:
    | IdleContext
    | SelectingCardOnBoardContext
    | SelectingMinionSlotsContext
    | ChoosingCardsContext = new IdleContext();

  constructor(private game: Game) {
    super(INTERACTION_STATES.IDLE);
    this.addTransitions([
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_MINION_SLOT,
        INTERACTION_STATES.SELECTING_MINION_SLOT
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS,
        INTERACTION_STATES.CHOOSING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_MINION_SLOT,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_MINION_SLOT,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_AFFINITY,
        INTERACTION_STATES.CHOOSING_AFFINITY
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_AFFINITY,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_AFFINITY,
        INTERACTION_STATES.IDLE
      )
    ]);
  }

  initialize() {}

  shutdown() {}

  serialize() {
    const context = this.getContext();
    return {
      state: context.state,
      ctx: context.ctx.serialize()
    } as SerializedInteractionContext;
  }

  getContext<T extends InteractionState>() {
    assert(
      this._ctx instanceof this.ctxDictionary[this.getState()],
      new CorruptedInteractionContextError()
    );
    return {
      state: this.getState() as T,
      ctx: this._ctx
    } as InteractionContext & { state: T };
  }

  async selectCardsOnBoard<T extends AnyCard>(options: {
    isElligible: (candidate: AnyCard, selectedCards: AnyCard[]) => boolean;
    canCommit: (selectedCards: AnyCard[]) => boolean;
    isDone(selectedCards: AnyCard[]): boolean;
    player: Player;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARDS_ON_BOARD);
    this._ctx = await this.ctxDictionary[
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
    ].create(this.game, options);

    return this.game.inputSystem.pause<T[]>();
  }

  async selectMinionSlot(options: {
    isElligible: (position: MinionPosition, selectedSlots: MinionPosition[]) => boolean;
    canCommit: (selectedSlots: MinionPosition[]) => boolean;
    isDone(selectedSlots: MinionPosition[]): boolean;
    player: Player;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_MINION_SLOT);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.SELECTING_MINION_SLOT].create(
      this.game,
      options
    );

    return this.game.inputSystem.pause<MinionPosition[]>();
  }

  async chooseCards(options: {
    player: Player;
    minChoiceCount: number;
    maxChoiceCount: number;
    choices: AnyCard[];
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_CARDS].create(
      this.game,
      options
    );

    return this.game.inputSystem.pause<AnyCard[]>();
  }

  async chooseAffinity(options: { player: Player; choices: Affinity[] }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_AFFINITY);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_AFFINITY].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<Affinity | null>();
  }

  onInteractionEnd() {
    this._ctx = new IdleContext();
  }
}

export class CorruptedInteractionContextError extends GameError {
  constructor() {
    super('Corrupted interaction context');
  }
}

export class InvalidPlayerError extends GameError {
  constructor() {
    super('Invalid player trying to interact');
  }
}

export class UnableToCommitError extends GameError {
  constructor() {
    super('Unable to commit');
  }
}

export class NotEnoughCardsError extends GameError {
  constructor() {
    super('Not enough cards selected');
  }
}

export class TooManyCardsError extends GameError {
  constructor() {
    super('Too many cards selected');
  }
}
