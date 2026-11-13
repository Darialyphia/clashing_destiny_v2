/**
 * Compatibility version shared by the client, the Convex API and the game server.
 *
 * Every package bundles this constant from the commit it was deployed from, so a
 * running client and the deployed API only disagree when they come from
 * different deploys. When they do, the client blocks behind an update screen
 * until it has loaded a build matching the API (see client/src/app-update).
 *
 * Bump it when already-deployed clients can't safely talk to the new backend:
 * Convex functions renamed or removed, changed arguments or return shapes,
 * engine rule changes the server simulates, and so on. Changes that old clients
 * can live with don't need a bump: they still get the new version, just without
 * being forced to.
 */
export const GAME_VERSION = 1;
