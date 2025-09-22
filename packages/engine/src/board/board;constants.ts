import type { Values } from '@game/shared';

export const MINION_SLOT_ZONES = {
  FRONT_ROW: 'front-row',
  BACK_ROW: 'back-row'
} as const;

export type MinionSlotZone = Values<typeof MINION_SLOT_ZONES>;
