import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  PLAYER_BEFORE_DRAW: 'player:before_draw',
  PLAYER_AFTER_DRAW: 'player:after_draw',
  PLAYER_BEFORE_PLAY_CARD: 'player:before_play_card',
  PLAYER_AFTER_PLAY_CARD: 'player:after_play_card',
  PLAYER_BEFORE_MANA_CHANGE: 'player:before_mana_change',
  PLAYER_AFTER_MANA_CHANGE: 'player:after_mana_change',
  PLAYER_BEFORE_GAIN_RUNE: 'player:before_gain_rune',
  PLAYER_AFTER_GAIN_RUNE: 'player:after_gain_rune',
  PLAYER_BEFORE_LOSE_RUNE: 'player:before_lose_rune',
  PLAYER_AFTER_LOSE_RUNE: 'player:after_lose_rune',
  PLAYER_BEFORE_PERFORM_RESOURCE_ACTION: 'player:before_perform_resource_action',
  PLAYER_AFTER_PERFORM_RESOURCE_ACTION: 'player:after_perform_resource_action',
  PLAYER_BEFORE_TAKE_DAMAGE: 'player:before_player_take_damage',
  PLAYER_AFTER_TAKE_DAMAGE: 'player:after_player_take_damage',
  PLAYER_BEFORE_HEAL: 'player:before_player_heal',
  PLAYER_AFTER_HEAL: 'player:after_player_heal',
  PLAYER_LEVEL_UP: 'player:level_up',
  PLAYER_GAIN_EXP: 'player:gain_exp'
} as const;
export type PlayerEvent = Values<typeof PLAYER_EVENTS>;

export const ARTIFACT_EVENTS = {
  ARTIFACT_EQUIPED: 'artifact:equiped',
  ARTIFACT_BEFORE_DURABILITY_CHANGE: 'artifact:before_durability_change',
  ARTIFACT_AFTER_DURABILITY_CHANGE: 'artifact:after_durability_change',
  ARTIFACT_BEFORE_DESTROY: 'artifact:before_destroy',
  ARTIFACT_AFTER_DESTROY: 'artifact:after_destroy'
} as const;
export type ArtifactEvent = Values<typeof ARTIFACT_EVENTS>;
