import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  PLAYER_START_TURN: 'player_start_turn',
  PLAYER_END_TURN: 'player_end_turn',
  PLAYER_BEFORE_DRAW: 'player_before_draw',
  PLAYER_AFTER_DRAW: 'player_after_draw',
  PLAYER_BEFORE_MANA_CHANGE: 'player_before_mana_change',
  PLAYER_AFTER_MANA_CHANGE: 'player_after_mana_change',
  PLAYER_LEVEL_UP: 'player:level_up',
  PLAYER_GAIN_EXP: 'player:gain_exp'
} as const;
export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
