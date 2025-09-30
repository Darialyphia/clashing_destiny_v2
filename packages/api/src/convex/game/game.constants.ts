import { ONE_MINUTE_IN_MS, type Values } from '@game/shared';

export const GAME_STATUS = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  ONGOING: 'ONGOING',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED'
} as const;

export type GameStatus = Values<typeof GAME_STATUS>;

export const GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS;
