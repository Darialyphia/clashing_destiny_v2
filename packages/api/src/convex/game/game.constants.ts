import { ONE_MINUTE_IN_MS, type Values } from '@game/shared';

export const GAME_STATUS = {
  INITIALIZING: 'INITIALIZING',
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  ONGOING: 'ONGOING',
  FINISHED: 'FINISHED',
  CANCELLED: 'CANCELLED'
} as const;

export type GameStatus = Values<typeof GAME_STATUS>;

// games the game server needs a room for
export const LIVE_GAME_STATUSES: GameStatus[] = [
  GAME_STATUS.INITIALIZING,
  GAME_STATUS.WAITING_FOR_PLAYERS,
  GAME_STATUS.ONGOING
];

// safety net for games no game server managed to set up, ie. when it is down
export const INITIALIZING_GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS / 4;
// safety net for games where players didnt manage to join in time
export const WAITING_FOR_PLAYERS_GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS;
// safety net so abandoned ongoing games don't stay ongoing forever
export const ONGOING_GAME_TIMEOUT_MS = ONE_MINUTE_IN_MS * 60 * 4;
