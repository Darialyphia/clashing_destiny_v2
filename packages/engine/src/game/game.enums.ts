import type { Values } from '@game/shared';

export const GAME_PHASES = {
  DRAW: 'draw_phase',
  // DESTINY: 'destiny_phase',
  MAIN: 'main_phase',
  ATTACK: 'attack_phase',
  END: 'end_phase',
  GAME_END: 'game_end'
} as const;
export type GamePhasesDict = typeof GAME_PHASES;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  BEFORE_CHANGE_PHASE: 'game_phase_before_change_phase',
  AFTER_CHANGE_PHASE: 'game_phase_after_change_phase'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;

export const TURN_EVENTS = {
  TURN_START: 'turn_start',
  TURN_END: 'turn_end',
  TURN_INITATIVE_CHANGE: 'turn_initiative_change',
  TURN_PASS: 'turn_pass'
} as const;
export type TurnEventName = Values<typeof TURN_EVENTS>;

export const GAME_PHASE_TRANSITIONS = {
  DRAW_FOR_TURN: 'draw_for_turn',
  DECLARE_ATTACK: 'declare_attack',
  FINISH_ATTACK: 'finish_attack',
  DECLARE_END_TURN: 'declare_end_turn',
  END_TURN: 'end_turn',
  PLAYER_WON: 'player_won'
} as const;
export type GamePhaseTransition = Values<typeof GAME_PHASE_TRANSITIONS>;

export const COMBAT_STEPS = {
  DECLARE_ATTACKER: 'declare-attacker',
  DECLARE_TARGET: 'declare-target',
  BUILDING_CHAIN: 'chain',
  RESOLVING_COMBAT: 'resolving'
} as const;

export type CombatStep = Values<typeof COMBAT_STEPS>;

export const EFFECT_TYPE = {
  CARD: 'CARD',
  ABILITY: 'ABILITY',
  DECLARE_BLOCKER: 'DECLARE_BLOCKER'
} as const;
export type EffectType = Values<typeof EFFECT_TYPE>;

export const GAME_QUESTIONS = {
  SUMMON_POSITION: 'summon_position'
};

export const INTERACTION_STATES = {
  IDLE: 'idle',
  SELECTING_CARDS_ON_BOARD: 'selecting_cards_on_board',
  CHOOSING_CARDS: 'choosing_cards',
  REARRANGING_CARDS: 'rearranging_cards',
  PLAYING_CARD: 'playing_card',
  USING_ABILITY: 'using_ability',
  ASK_QUESTION: 'ask_question'
} as const;
export type InteractionStateDict = typeof INTERACTION_STATES;
export type InteractionState = Values<typeof INTERACTION_STATES>;

export const INTERACTION_STATE_TRANSITIONS = {
  START_SELECTING_CARDS_ON_BOARD: 'start_selecting_cards_on_board',
  COMMIT_SELECTING_CARDS_ON_BOARD: 'commit_selecting_cards_on_board',
  START_CHOOSING_CARDS: 'start_choosing_cards',
  COMMIT_CHOOSING_CARDS: 'commit_choosing_cards',
  START_PLAYING_CARD: 'start_playing_card',
  COMMIT_PLAYING_CARD: 'commit_playing_card',
  CANCEL_PLAYING_CARD: 'cancel_playing_card',
  START_USING_ABILITY: 'start_using_ability',
  COMMIT_USING_ABILITY: 'commit_using_ability',
  CANCEL_USING_ABILITY: 'cancel_using_ability',
  START_ASKING_QUESTION: 'start_asking_question',
  COMMIT_ASKING_QUESTION: 'commit_asking_question',
  CANCEL_ASKING_QUESTION: 'cancel_asking_question',
  START_REARRANGING_CARDS: 'start_rearranging_cards',
  COMMIT_REARRANGING_CARDS: 'commit_rearranging_cards',
  CANCEL_REARRANGING_CARDS: 'cancel_rearranging_cards'
} as const;
export type InteractionStateTransition = Values<typeof INTERACTION_STATE_TRANSITIONS>;
