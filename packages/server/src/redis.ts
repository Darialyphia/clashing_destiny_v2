import type { GameId } from '@game/api';
import { Redis } from '@upstash/redis';

export const redis = () =>
  new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

export const REDIS_KEYS = {
  GAME_STATE: (gameId: GameId) => `game:state:${gameId}`,
  GAME_HISTORY: (gameId: GameId) => `game:history:${gameId}`
};
