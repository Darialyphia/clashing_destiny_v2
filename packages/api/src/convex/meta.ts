import { GAME_VERSION } from '@game/shared';
import { query } from './_generated/server';

/**
 * Lets clients detect that they don't match the deployed backend.
 *
 * Every client ever shipped keeps calling this after each deploy, so it is the
 * one contract that must never break: don't rename it, don't add arguments and
 * don't remove or retype `gameVersion`. Adding fields is fine.
 */
export const version = query({
  args: {},
  handler: () => {
    return { gameVersion: GAME_VERSION };
  }
});
