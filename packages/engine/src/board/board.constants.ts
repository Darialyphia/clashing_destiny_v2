import type { Values } from '@game/shared';

export const BOARD_SLOT_ZONES = {
  FRONT_ROW: 'front-row',
  BACK_ROW: 'back-row'
} as const;

export type BoardSlotZone = Values<typeof BOARD_SLOT_ZONES>;
