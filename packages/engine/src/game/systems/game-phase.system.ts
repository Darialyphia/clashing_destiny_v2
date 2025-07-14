import {
  assert,
  StateMachine,
  stateTransition,
  type BetterExtract,
  type Values
} from '@game/shared';
import type { Player } from '../../player/player.entity';
import type { Game } from '../game';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GAME_PHASES, GAME_PHASE_EVENTS, type GamePhase } from '../game.enums';
import { CombatPhase } from '../phases/combat.phase';
import { DrawPhase } from '../phases/draw.phase';
import { MainPhase } from '../phases/main.phase';
import { EndPhase } from '../phases/end.phase';
import { GameEndPhase } from '../phases/game-end.phase';

export const GAME_PHASE_TRANSITIONS = {
  DRAW_FOR_TURN: 'draw_for_turn',
  DRAW_FOR_FIRST_TURN: 'draw_for_first_turn',
  GO_TO_MAIN_PHASE: 'go_to_main_phase',
  DECLARE_ATTACK: 'declare_attack',
  FINISH_ATTACK: 'finish_attack',
  DECLARE_END_PHASE: 'declare_end_phase',
  FINISH_END_TURN: 'finish_end_turn',
  PLAYER_WON: 'player_won'
} as const;
export type GamePhaseTransition = Values<typeof GAME_PHASE_TRANSITIONS>;

export type GamePhaseEventMap = {
  [GAME_PHASE_EVENTS.GAME_TURN_START]: GameTurnEvent;
  [GAME_PHASE_EVENTS.GAME_TURN_END]: GameTurnEvent;
  [GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE]: GamePhaseBeforeChangeEvent;
  [GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE]: GamePhaseAfterChangeEvent;
};

export type GamePhaseContext =
  | {
      state: BetterExtract<GamePhase, 'draw_phase'>;
      ctx: DrawPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'main_phase'>;
      ctx: MainPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'attack_phase'>;
      ctx: CombatPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'end_phase'>;
      ctx: EndPhase;
    }
  | {
      state: BetterExtract<GamePhase, 'game_end'>;
      ctx: GameEndPhase;
    };

export type SerializedGamePhaseContext =
  | {
      state: BetterExtract<GamePhase, 'draw_phase'>;
      ctx: ReturnType<DrawPhase['serialize']>;
    }
  | {
      state: BetterExtract<GamePhase, 'main_phase'>;
      ctx: ReturnType<MainPhase['serialize']>;
    }
  | {
      state: BetterExtract<GamePhase, 'attack_phase'>;
      ctx: ReturnType<CombatPhase['serialize']>;
    }
  | {
      state: BetterExtract<GamePhase, 'end_phase'>;
      ctx: ReturnType<EndPhase['serialize']>;
    }
  | {
      state: Extract<GamePhase, 'game_end'>;
      ctx: ReturnType<GameEndPhase['serialize']>;
    };

export class GamePhaseSystem extends StateMachine<GamePhase, GamePhaseTransition> {
  private _winner: Player | null = null;

  private _elapsedTurns = 0;

  private _turnPlayer!: Player;

  private firstPlayer!: Player;

  readonly ctxDictionary = {
    [GAME_PHASES.DRAW]: DrawPhase,
    [GAME_PHASES.MAIN]: MainPhase,
    [GAME_PHASES.ATTACK]: CombatPhase,
    [GAME_PHASES.END]: EndPhase,
    [GAME_PHASES.GAME_END]: GameEndPhase
  };

  private _ctx: GamePhaseContext['ctx'];

  constructor(private game: Game) {
    super(GAME_PHASES.DRAW);
    this._ctx = new DrawPhase(this.game);
    this.addTransitions([
      stateTransition(
        GAME_PHASES.DRAW,
        GAME_PHASE_TRANSITIONS.DRAW_FOR_TURN,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.DRAW,
        GAME_PHASE_TRANSITIONS.DRAW_FOR_FIRST_TURN,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.DECLARE_ATTACK,
        GAME_PHASES.ATTACK
      ),
      stateTransition(
        GAME_PHASES.ATTACK,
        GAME_PHASE_TRANSITIONS.FINISH_ATTACK,
        GAME_PHASES.MAIN
      ),
      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.DECLARE_END_PHASE,
        GAME_PHASES.END
      ),
      stateTransition(
        GAME_PHASES.END,
        GAME_PHASE_TRANSITIONS.FINISH_END_TURN,
        GAME_PHASES.DRAW
      ),

      stateTransition(
        GAME_PHASES.MAIN,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      ),
      stateTransition(
        GAME_PHASES.DRAW,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      ),
      stateTransition(
        GAME_PHASES.ATTACK,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      ),
      stateTransition(
        GAME_PHASES.END,
        GAME_PHASE_TRANSITIONS.PLAYER_WON,
        GAME_PHASES.GAME_END
      )
    ]);
  }

  async initialize() {
    // const idx = this.game.rngSystem.nextInt(this.game.playerSystem.players.length);
    this._turnPlayer = this.game.playerSystem.player1;
    this.firstPlayer = this._turnPlayer;
  }

  async startGame() {
    await (this._ctx as DrawPhase).onEnter();
  }

  shutdown() {}

  getContext<T extends GamePhase>() {
    assert(
      this._ctx instanceof this.ctxDictionary[this.getState()],
      new CorruptedGamephaseContextError()
    );
    return {
      state: this.getState() as T,
      ctx: this._ctx
    } as GamePhaseContext & { state: T };
  }

  get winner() {
    return this._winner;
  }

  get elapsedTurns() {
    return this._elapsedTurns;
  }

  get turnPlayer() {
    return this._turnPlayer;
  }

  private startGameTurn() {
    return this.game.emit(
      GAME_PHASE_EVENTS.GAME_TURN_START,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  private endGameTurn() {
    this._elapsedTurns++;
    return this.game.emit(
      GAME_PHASE_EVENTS.GAME_TURN_END,
      new GameTurnEvent({ turnCount: this.elapsedTurns })
    );
  }

  async sendTransition(transition: GamePhaseTransition) {
    const previousPhase = this.getState();
    const nextPhase = this.getNextState(transition);
    await this.game.emit(
      GAME_PHASE_EVENTS.BEFORE_CHANGE_PHASE,
      new GamePhaseBeforeChangeEvent({
        from: previousPhase,
        to: nextPhase!
      })
    );
    this.dispatch(transition);
    await this._ctx.onExit();
    this._ctx = new this.ctxDictionary[nextPhase!](this.game);
    await this.game.emit(
      GAME_PHASE_EVENTS.AFTER_CHANGE_PHASE,
      new GamePhaseAfterChangeEvent({
        from: previousPhase,
        to: this.getContext()
      })
    );
    await this._ctx.onEnter();
  }

  async endTurn() {
    assert(this.can(GAME_PHASE_TRANSITIONS.FINISH_END_TURN), new WrongGamePhaseError());
    await this.turnPlayer.endTurn();

    const nextPlayer = this._turnPlayer.opponent;
    if (nextPlayer.equals(this.firstPlayer)) {
      await this.endGameTurn();
      this._turnPlayer = nextPlayer;
      await this.startGameTurn();
    } else {
      this._turnPlayer = nextPlayer;
    }

    await this.game.inputSystem.schedule(async () => {
      await this.sendTransition(GAME_PHASE_TRANSITIONS.FINISH_END_TURN);
      await this._turnPlayer.startTurn();
    });
  }

  async declareEndPhase() {
    assert(GAME_PHASE_TRANSITIONS.DECLARE_END_PHASE, new WrongGamePhaseError());
    await this.sendTransition(GAME_PHASE_TRANSITIONS.DECLARE_END_PHASE);
  }

  async startCombat() {
    assert(this.can(GAME_PHASE_TRANSITIONS.DECLARE_ATTACK), new WrongGamePhaseError());
    await this.sendTransition(GAME_PHASE_TRANSITIONS.DECLARE_ATTACK);
  }

  async declareWinner(player: Player) {
    assert(this.can(GAME_PHASE_TRANSITIONS.PLAYER_WON), new WrongGamePhaseError());
    this._winner = player;
    await this.sendTransition(GAME_PHASE_TRANSITIONS.PLAYER_WON);
  }

  serialize() {
    const context = this.getContext();
    return {
      state: context.state,
      ctx: context.ctx.serialize()
    } as SerializedGamePhaseContext;
  }
}

export class GameTurnEvent extends TypedSerializableEvent<
  { turnCount: number },
  { turnCount: number }
> {
  serialize(): { turnCount: number } {
    return {
      turnCount: this.data.turnCount
    };
  }
}

export class GamePhaseBeforeChangeEvent extends TypedSerializableEvent<
  { from: GamePhase; to: GamePhase },
  { from: GamePhase; to: GamePhase }
> {
  serialize() {
    return {
      from: this.data.from,
      to: this.data.to
    };
  }
}

export class GamePhaseAfterChangeEvent extends TypedSerializableEvent<
  { from: GamePhase; to: GamePhaseContext },
  { from: GamePhase; to: SerializedGamePhaseContext }
> {
  serialize() {
    return {
      from: this.data.from,
      to: {
        state: this.data.to.state,
        ctx: this.data.to.ctx.serialize() as any // Type assertion to match SerializedGamePhaseContext
      }
    };
  }
}

export class WrongGamePhaseError extends Error {
  constructor() {
    super('Wrong game phase');
  }
}

export class CorruptedGamephaseContextError extends Error {
  constructor() {
    super('Corrupted game phase context');
  }
}
