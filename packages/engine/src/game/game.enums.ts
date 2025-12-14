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
