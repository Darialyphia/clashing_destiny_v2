import type { Values } from '@game/shared';

export const BOARD_SLOT_ZONES = {
  ATTACK_ZONE: 'attack-zone',
  DEFENSE_ZONE: 'defense-zone'
} as const;

export type BoardSlotZone = Values<typeof BOARD_SLOT_ZONES>;
