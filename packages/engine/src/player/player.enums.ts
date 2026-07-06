import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  PLAYER_BEFORE_DRAW: 'player_before_draw',
  PLAYER_AFTER_DRAW: 'player_after_draw',
  PLAYER_BEFORE_MANA_CHANGE: 'player_before_mana_change',
  PLAYER_AFTER_MANA_CHANGE: 'player_after_mana_change',
  PLAYER_BEFORE_RUNE_CHANGE: 'player_before_rune_change',
  PLAYER_AFTER_RUNE_CHANGE: 'player_after_rune_change',
  PLAYER_BEFORE_GAIN_VICTORY_POINT: 'player_before_gain_victory_point',
  PLAYER_AFTER_GAIN_VICTORY_POINT: 'player_after_gain_victory_point'
} as const;
export type PlayerEvent = Values<typeof PLAYER_EVENTS>;

export const RUNES = {
  MIGHT: 'might',
  WISDOM: 'wisdom',
  FOCUS: 'focus',
  RESONANCE: 'resonance'
} as const;
export type Rune = Values<typeof RUNES>;
