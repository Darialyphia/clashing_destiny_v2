import { ONE_MINUTE_IN_MS, type Values } from '@game/shared';

export const GAME_STATUS = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  ONGOING: 'ONGOING',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED'
} as const;

export type GameStatus = Values<typeof GAME_STATUS>;

// safety net for games where players didnt manage to join in time
export const WAITING_FOR_PLAYERS_GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS;
// safety net so abandoned ongoing games don't stay ongoing forever
export const ONGOING_GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS * 60 * 4;
