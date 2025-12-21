import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  PLAYER_START_TURN: 'player_start_turn',
  PLAYER_END_TURN: 'player_end_turn',
  PLAYER_PAY_FOR_DESTINY_COST: 'player_pay_for_destiny_cost',
  PLAYER_BEFORE_DRAW: 'player_before_draw',
  PLAYER_AFTER_DRAW: 'player_after_draw',
  BEFORE_GAIN_RUNE: 'before_gain_rune',
  AFTER_GAIN_RUNE: 'after_gain_rune',
  BEFORE_SPEND_RUNE: 'before_spend_rune',
  AFTER_SPEND_RUNE: 'after_spend_rune'
} as const;
export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
