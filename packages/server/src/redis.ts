import type { GameId } from '@game/api';
import { Redis } from '@upstash/redis';

export const redis = () =>
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

// safety net for keys that never get cleaned up (server crash, missed status update...)
export const REDIS_TTL_SECONDS = 24 * 60 * 60;

export const REDIS_KEYS = {
  GAME_STATE: (gameId: GameId) => `game:state:${gameId}`,
  GAME_HISTORY: (gameId: GameId) => `game:history:${gameId}`
};

export const deleteGameKeys = (client: Redis, gameId: GameId) =>
  client.del(REDIS_KEYS.GAME_STATE(gameId), REDIS_KEYS.GAME_HISTORY(gameId));
