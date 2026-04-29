import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  UNIT_BEFORE_MOVE: 'unit.before_move',
  UNIT_AFTER_MOVE: 'unit.after_move',
  UNIT_BEFORE_DESTROY: 'unit.before_destroy',
  UNIT_AFTER_DESTROY: 'unit.after_destroy',
  UNIT_BEFORE_TELEPORT: 'unit.before_teleport',
  UNIT_AFTER_TELEPORT: 'unit.after_teleport',
  UNIT_BEFORE_BOUNCE: 'unit.before_bounce',
  UNIT_AFTER_BOUNCE: 'unit.after_bounce',
  UNIT_BEFORE_HEAL: 'unit.before_heal',
  UNIT_AFTER_HEAL: 'unit.after_heal',
  UNIT_EFFECT_TRIGGERED: 'unit.effect_triggered'
} as const;
export type UnitEvent = Values<typeof UNIT_EVENTS>;
