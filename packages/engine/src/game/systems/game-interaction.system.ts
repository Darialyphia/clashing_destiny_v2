import {
  type BetterExtract,
  type Serializable,
  assert,
  StateMachine,
  stateTransition
} from '@game/shared';

import type { Game } from '../game';
import type { AnyCard, CardTargetOrigin } from '../../card/entities/card.entity';
import { CorruptedInteractionContextError } from '../game-error';
import type { Player } from '../../player/player.entity';
import { SelectingCardOnBoardContext } from '../interactions/selecting-cards-on-board.interaction';
import { ChoosingCardsContext } from '../interactions/choosing-cards.interaction';
import { IdleContext } from '../interactions/idle.interaction';
import { CARD_DECK_SOURCES } from '../../card/card.enums';
import { PlayCardContext } from '../interactions/play-card.interaction';
import { IllegalCardPlayedError } from '../../input/input-errors';
import { UseAbilityContext } from '../interactions/use-ability.interaction';
import type { Ability, AbilityOwner } from '../../card/entities/ability.entity';
import { GAME_EVENTS } from '../game.events';
import { CardDeclareUseAbilityEvent } from '../../card/card.events';
import { AskQuestionContext } from '../interactions/ask-question.interaction';
import {
  INTERACTION_STATE_TRANSITIONS,
  INTERACTION_STATES,
  type InteractionState,
  type InteractionStateTransition
} from '../game.enums';
import {
  RearrangeCardsContext,
  type RearrangeCardBucket
} from '../interactions/rearrange-cards.interaction';
import { ChooseChainEffectContext } from '../interactions/choose-chain-effect';
import type { Effect } from '../effect-chain';

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
      state: BetterExtract<InteractionState, 'choosing_cards'>;
      ctx: ChoosingCardsContext;
    }
  | {
      state: BetterExtract<InteractionState, 'choosing_chain_effect'>;
      ctx: ChooseChainEffectContext;
    }
  | {
      state: BetterExtract<InteractionState, 'playing_card'>;
      ctx: PlayCardContext;
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
      state: Extract<InteractionState, 'choosing_cards'>;
      ctx: ReturnType<ChoosingCardsContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'choosing_chain_effect'>;
      ctx: ReturnType<ChooseChainEffectContext['serialize']>;
    }
  | {
      state: Extract<InteractionState, 'playing_card'>;
      ctx: ReturnType<PlayCardContext['serialize']>;
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
export class GameInteractionSystem
  extends StateMachine<InteractionState, InteractionStateTransition>
  implements Serializable<SerializedInteractionContext>
{
  private ctxDictionary = {
    [INTERACTION_STATES.IDLE]: IdleContext,
    [INTERACTION_STATES.SELECTING_CARDS_ON_BOARD]: SelectingCardOnBoardContext,
    [INTERACTION_STATES.CHOOSING_CARDS]: ChoosingCardsContext,
    [INTERACTION_STATES.CHOOSING_CHAIN_EFFECT]: ChooseChainEffectContext,
    [INTERACTION_STATES.PLAYING_CARD]: PlayCardContext,
    [INTERACTION_STATES.USING_ABILITY]: UseAbilityContext,
    [INTERACTION_STATES.ASK_QUESTION]: AskQuestionContext,
    [INTERACTION_STATES.REARRANGING_CARDS]: RearrangeCardsContext
  } as const;

  private _ctx:
    | IdleContext
    | SelectingCardOnBoardContext
    | ChoosingCardsContext
    | ChooseChainEffectContext
    | PlayCardContext
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
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS,
        INTERACTION_STATES.CHOOSING_CARDS
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CHAIN_EFFECT,
        INTERACTION_STATES.CHOOSING_CHAIN_EFFECT
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CHAIN_EFFECT,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CHAIN_EFFECT,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_SELECTING_CARDS_ON_BOARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.CHOOSING_CARDS,
        INTERACTION_STATE_TRANSITIONS.COMMIT_CHOOSING_CARDS,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.IDLE,
        INTERACTION_STATE_TRANSITIONS.START_PLAYING_CARD,
        INTERACTION_STATES.PLAYING_CARD
      ),
      stateTransition(
        INTERACTION_STATES.PLAYING_CARD,
        INTERACTION_STATE_TRANSITIONS.COMMIT_PLAYING_CARD,
        INTERACTION_STATES.IDLE
      ),
      stateTransition(
        INTERACTION_STATES.PLAYING_CARD,
        INTERACTION_STATE_TRANSITIONS.CANCEL_PLAYING_CARD,
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
    return this.game.effectChainSystem.currentChain
      ? this.game.effectChainSystem.currentChain.currentPlayer
      : this.game.turnSystem.initiativePlayer;
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

  async selectCardsOnBoard<T extends AnyCard>(options: {
    isElligible: (candidate: AnyCard, selectedCards: AnyCard[]) => boolean;
    canCommit: (selectedCards: AnyCard[]) => boolean;
    isDone(selectedCards: AnyCard[]): boolean;
    player: Player;
    origin: CardTargetOrigin;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_SELECTING_CARDS_ON_BOARD);
    this._ctx = await this.ctxDictionary[
      INTERACTION_STATES.SELECTING_CARDS_ON_BOARD
    ].create(this.game, options);

    return this.game.inputSystem.pause<T[]>();
  }

  async chooseCards<T extends AnyCard>(options: {
    player: Player;
    minChoiceCount: number;
    maxChoiceCount: number;
    choices: AnyCard[];
    label: string;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_CARDS].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<T[]>();
  }

  async chooseChainEffect(options: {
    player: Player;
    isElligible: (effect: Effect) => boolean;
    label: string;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_CHOOSING_CHAIN_EFFECT);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.CHOOSING_CHAIN_EFFECT].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<Effect>();
  }

  async rearrangeCards<
    T extends Record<string, AnyCard[]> = Record<string, AnyCard[]>
  >(options: {
    player: Player;
    buckets: RearrangeCardBucket[];
    label: string;
    source: AnyCard;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_REARRANGING_CARDS);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.REARRANGING_CARDS].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<T>();
  }

  async askQuestion<T extends string = string>(options: {
    player: Player;
    choices: Array<{ id: string; label: string }>;
    source: AnyCard;
    minChoiceCount: number;
    maxChoiceCount: number;
    label: string;
    questionId: string;
  }) {
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_ASKING_QUESTION);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.ASK_QUESTION].create(
      this.game,
      options
    );
    return this.game.inputSystem.pause<T[]>();
  }

  async declarePlayCardIntent(card: AnyCard, player: Player) {
    assert(
      this.getState() === INTERACTION_STATES.IDLE,
      new CorruptedInteractionContextError()
    );

    assert(this.isInteractive(player), new IllegalCardPlayedError());

    assert(card, new IllegalCardPlayedError());
    assert(card.canPlay(), new IllegalCardPlayedError());

    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_PLAYING_CARD);

    this._ctx = await this.ctxDictionary[INTERACTION_STATES.PLAYING_CARD].create(
      this.game,
      {
        card,
        player
      }
    );
    if (card.manaCost === 0 || card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      await this._ctx.commit(this._ctx.player, []);
    }

    await this.game.inputSystem.askForPlayerInput();
  }

  async declareUseAbilityIntent(ability: Ability<AbilityOwner>, player: Player) {
    assert(
      this.getState() === INTERACTION_STATES.IDLE,
      new CorruptedInteractionContextError()
    );

    assert(this.isInteractive(player), new IllegalCardPlayedError());

    assert(ability.canUse, new IllegalCardPlayedError());
    this.dispatch(INTERACTION_STATE_TRANSITIONS.START_USING_ABILITY);
    this._ctx = await this.ctxDictionary[INTERACTION_STATES.USING_ABILITY].create(
      this.game,
      {
        ability,
        player
      }
    );
    await this.game.emit(
      GAME_EVENTS.CARD_DECLARE_USE_ABILITY,
      new CardDeclareUseAbilityEvent({
        card: ability.card,
        abilityId: ability.abilityId
      })
    );
    if (ability.manaCost === 0) {
      await this._ctx.commit(this._ctx.player, []);
    }
    await this.game.inputSystem.askForPlayerInput();
  }

  onInteractionEnd() {
    this._ctx = new IdleContext(this.game);
  }
}
