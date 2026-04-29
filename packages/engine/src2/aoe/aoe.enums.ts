import type { Values } from '@game/shared';

export const TARGETING_TYPES = {
  EMPTY: 'empty',
  ALLY_UNIT: 'ally_unit',
  ENEMY_UNIT: 'enemy_unit',
  UNIT: 'unit',
  ANYWHERE: 'anywhere'
} as const;

export type TargetingType = Values<typeof TARGETING_TYPES>;
