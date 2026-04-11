import type { Values } from '@game/shared';

export const BOARD_SLOT_ROWS = {
  FRONT_ROW: 'front-row',
  BACK_ROW: 'back-row'
} as const;

export type BoardSlotRow = Values<typeof BOARD_SLOT_ROWS>;
