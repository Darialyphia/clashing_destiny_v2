import {
  type BetterExtract,
  type Serializable,
  assert,
  StateMachine,
  stateTransition
} from '@game/shared';

import type { Game } from '../game';
import type { AnyCard } from '../../card/entities/card.entity';
import { CorruptedInteractionContextError } from '../game-error';
import type { Player } from '../../player/player.entity';
import {
  SelectingCardOnBoardContext,
  type SelectingCardOnBoardContextOptions
} from '../interactions/selecting-cards-on-board.interaction';
import {
  ChoosingCardsContext,
  type ChoosingCardsContextOptions
} from '../interactions/choosing-cards.interaction';
import { IdleContext } from '../interactions/idle.interaction';
import { IllegalCardPlayedError } from '../../input/input-errors';
import {
  UseAbilityContext,
  type UseAbilityContextOptions
} from '../interactions/use-ability.interaction';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { GAME_EVENTS } from '../game.events';
import { CardDeclareUseAbilityEvent } from '../../card/card.events';
import {
  AskQuestionContext,
  type AskQuestionContextOptions
} from '../interactions/ask-question.interaction';
import {
  INTERACTION_EVENTS,
  INTERACTION_STATE_TRANSITIONS,
  INTERACTION_STATES,
  type InteractionState,
  type InteractionStateTransition
} from '../game.enums';
import {
  RearrangeCardsContext,
  type RearrangeCardBucket,
  type RearrangeCardsContextOptions
} from '../interactions/rearrange-cards.interaction';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import {
  SelectingSpaceOnBoardContext,
  type SelectingSpaceOnBoardContextOptions
} from '../interactions/selecting-space-on-board';
import type { BoardSpace } from '../../board/board-space.entity';

export type InteractionContext =
  | {
      state: BetterExtract<InteractionState, 'idle'>;
      ctx: IdleContext;
    }
  | {
      state: BetterExtract<InteractionState, 'selecting_cards_on_board'>;
      ctx: SelectingCardOnBoardContext;
    }
  | {
      state: BetterExtract<InteractionState, 'select_space_on_board'>;
      ctx: SelectingSpaceOnBoardContext;
    }
  | {
      state: BetterExtract<InteractionState, 'choosing_cards'>;
      ctx: ChoosingCardsContext;
    }
  | {
      state: BetterExtract<InteractionState, 'using_ability'>;
      ctx: UseAbilityContext;
    }
  | {
      state: BetterExtract<InteractionState, 'ask_question'>;
      ctx: AskQuestionContext;
    }
  | {
      state: BetterExtract<InteractionState, 'rearranging_cards'>;
      ctx: RearrangeCardsContext;
    };

export type SerializedInteractionContext =
  | {
      state: Extract<InteractionState, 'idle'>;
      ctx: ReturnType<IdleContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'selecting_cards_on_board'>;
      ctx: ReturnType<SelectingCardOnBoardContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'select_space_on_board'>;
      ctx: ReturnType<SelectingSpaceOnBoardContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'choosing_cards'>;
      ctx: ReturnType<ChoosingCardsContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'using_ability'>;
      ctx: ReturnType<UseAbilityContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'ask_question'>;
      ctx: ReturnType<AskQuestionContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'rearranging_cards'>;
      ctx: ReturnType<RearrangeCardsContext['serialize']>;
    };

export type InteractionEventMap = {
  [INTERACTION_EVENTS.INTERACTION_BEFORE_CHANGE_STATE]: InteractionBeforeChangeEvent;
  [INTERACTION_EVENTS.INTERACTION_AFTER_CHANGE_STATE]: InteractionAfterChangeEvent;
};

export type InteractionResult<T> =
  | {
      cancelled: false;
      result: T;
    }
  | {
      cancelled: true;
      result: null;
    };

export class GameInteractionSystem
  extends StateMachine<InteractionState, InteractionStateTransition>
  implements Serializable<SerializedInteractionContext>
{
  private ctxDictionary = {
    [INTERACTION_STATES.IDLE]: IdleContext,
    [INTERACTION_STATES.SELECTING_CARDS_ON_BOARD]: SelectingCardOnBoardContext,
    [INTERACTION_STATES.SELECTING_SPACE_ON_BOARD]: SelectingSpaceOnBoardContext,
    [INTERACTION_STATES.CHOOSING_CARDS]: ChoosingCardsContext,
    [INTERACTION_STATES.USING_ABILITY]: UseAbilityContext,
    [INTERACTION_STATES.ASK_QUESTION]: AskQuestionContext,
    [INTERACTION_STATES.REARRANGING_CARDS]: RearrangeCardsContext
  } as const;

  private _ctx:
    | IdleContext
    | SelectingCardOnBoardContext
    | SelectingSpaceOnBoardContext
    | ChoosingCardsContext
    | UseAbilityContext
    | AskQuestionContext
    | RearrangeCardsContext;

  constructor(private game: Game) {
    super(INTERACTION_STATES.IDLE);
    this.addTransitions([
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),

      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS,
        INTERACTION_STATES.CHOOSING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.CANCEL_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),

      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.CANCEL_SELECTING_SPACE_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),

      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_USING_ABILITY,
        INTERACTION_STATES.USING_ABILITY
      ),
      stateTransition(
        INTERACTION_STATES.USING_ABILITY,
        INTERACTION_STATE_TRANSITIONS.COMMIT_USING_ABILITY,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.USING_ABILITY,
        INTERACTION_STATE_TRANSITIONS.CANCEL_USING_ABILITY,
        INTERACTION_STATES.IDLE
      ),

      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_ASKING_QUESTION,
        INTERACTION_STATES.ASK_QUESTION
      ),
      stateTransition(
        INTERACTION_STATES.ASK_QUESTION,
        INTERACTION_STATE_TRANSITIONS.COMMIT_ASKING_QUESTION,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.ASK_QUESTION,
        INTERACTION_STATE_TRANSITIONS.CANCEL_ASKING_QUESTION,
        INTERACTION_STATES.IDLE
      ),

      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_REARRANGING_CARDS,
        INTERACTION_STATES.REARRANGING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.REARRANGING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_REARRANGING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.REARRANGING_CARDS,
        INTERACTION_STATE_TRANSITIONS.CANCEL_REARRANGING_CARDS,
        INTERACTION_STATES.IDLE
      )
    ]);
    this._ctx = new IdleContext(this.game);
  }

  initialize() {}

  shutdown() {}

  get interactivePlayer() {
    return this.game.turnSystem.initiativePlayer;
  }

  isInteractive(player: Player) {
    return player.equals(this.interactivePlayer);
  }

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

  async sendTransition(transition: InteractionStateTransition, options: any) {
    const previousState = this.getState();
    const nextState = this.getNextState(transition);

    await this.game.emit(
      INTERACTION_EVENTS.INTERACTION_BEFORE_CHANGE_STATE,
      new InteractionBeforeChangeEvent({
        from: previousState,
        to: nextState!
      })
    );

    this.dispatch(transition);

    this._ctx = await this.ctxDictionary[nextState!].create(this.game, options);

    await this.game.emit(
      INTERACTION_EVENTS.INTERACTION_AFTER_CHANGE_STATE,
      new InteractionAfterChangeEvent({
        from: previousState,
        to: this.getContext()
      })
    );
  }

  async selectCardsOnBoard<T extends AnyCard>(
    options: SelectingCardOnBoardContextOptions
  ) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARDS_ON_BOARD);
    this._ctx = await this.ctxDictionary[
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
    ].create(this.game, options);

    return this.game.inputSystem.pause<InteractionResult<T[]>>();
  }

  async selectSpacesOnBoard<T extends AnyCard>(
    options: SelectingSpaceOnBoardContextOptions
  ) {
    await this.sendTransition(
      INTERACTION_STATE_TRANSITIONS.START_SELECTING_SPACE_ON_BOARD,
      options
    );

    const { ctx } = this.getContext<'select_space_on_board'>();
    if (ctx.elligibleSpaces.length === 0) {
      await this.sendTransition(
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_SPACE_ON_BOARD,
        {}
      );
      return {
        cancelled: false,
        result: []
      } as InteractionResult<BoardSpace[]>;
    } else {
      return this.game.inputSystem.pause<InteractionResult<BoardSpace[]>>();
    }
  }

  async chooseCards<T extends AnyCard>(options: ChoosingCardsContextOptions) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_CARDS].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<InteractionResult<T[]>>();
  }

  async rearrangeCards<T extends Record<string, AnyCard[]> = Record<string, AnyCard[]>>(
    options: RearrangeCardsContextOptions
  ) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_REARRANGING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.REARRANGING_CARDS].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<InteractionResult<T>>();
  }

  async askQuestion<T extends string = string>(options: AskQuestionContextOptions) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_ASKING_QUESTION);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.ASK_QUESTION].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<InteractionResult<T>>();
  }

  async declareUseAbilityIntent(options: UseAbilityContextOptions) {
    assert(
      this.getState() === INTERACTION_STATES.IDLE,
      new CorruptedInteractionContextError()
    );

    assert(this.isInteractive(options.player), new IllegalCardPlayedError());

    assert(options.ability.canUse, new IllegalCardPlayedError());
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_USING_ABILITY);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.USING_ABILITY].create(
      this.game,
      options
    );
    await this.game.emit(
      GAME_EVENTS.CARD_DECLARE_USE_ABILITY,
      new CardDeclareUseAbilityEvent({
        card: options.ability.card,
        abilityId: options.ability.abilityId
      })
    );
    await this._ctx.commit(this._ctx.player);
  }

  onInteractionEnd() {
    this._ctx = new IdleContext(this.game);
  }
}

export class InteractionBeforeChangeEvent extends TypedSerializableEvent<
  { from: InteractionState; to: InteractionState },
  { from: InteractionState; to: InteractionState }
> {
  serialize() {
    return {
      from: this.data.from,
      to: this.data.to
    };
  }
}

export class InteractionAfterChangeEvent extends TypedSerializableEvent<
  { from: InteractionState; to: InteractionContext },
  { from: InteractionState; to: SerializedInteractionContext }
> {
  serialize() {
    return {
      from: this.data.from,
      to: {
        state: this.data.to.state,
        ctx: this.data.to.ctx.serialize() as any // Type assertion to match SerializedInteractionStateContext
      }
    };
  }
}
