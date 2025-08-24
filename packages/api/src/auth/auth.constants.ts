import { ONE_DAY_IN_SECONDS, ONE_MINUTE_IN_MS } from '@game/shared';

export const PASSWORD_TOKEN_EXPIRES_IN = ONE_MINUTE_IN_MS * 60 * 2;

export const DEFAULT_SESSION_TOTAL_DURATION_MS = ONE_DAY_IN_SECONDS * 30 * 1000; // 30 days

export const DEFAULT_USERNAME = 'Anonymous';
