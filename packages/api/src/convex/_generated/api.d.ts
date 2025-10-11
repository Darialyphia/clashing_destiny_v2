/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as card_cardCopies from "../card/cardCopies.js";
import type * as cards from "../cards.js";
import type * as deck_premadeDecks from "../deck/premadeDecks.js";
import type * as deck_usecases_grantPremadeDeck from "../deck/usecases/grantPremadeDeck.js";
import type * as decks from "../decks.js";
import type * as friends from "../friends.js";
import type * as games from "../games.js";
import type * as gifts from "../gifts.js";
import type * as init from "../init.js";
import type * as lobbies from "../lobbies.js";
import type * as lobby_usecases_setupLobbyGame from "../lobby/usecases/setupLobbyGame.js";
import type * as matchmaking from "../matchmaking.js";
import type * as ping from "../ping.js";
import type * as shared_container from "../shared/container.js";
import type * as shared_entity from "../shared/entity.js";
import type * as shared_eventEmitter from "../shared/eventEmitter.js";
import type * as usecase from "../usecase.js";
import type * as users_username from "../users/username.js";
import type * as utils_email from "../utils/email.js";
import type * as utils_error from "../utils/error.js";
import type * as utils_password from "../utils/password.js";
import type * as utils_randomString from "../utils/randomString.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "card/cardCopies": typeof card_cardCopies;
  cards: typeof cards;
  "deck/premadeDecks": typeof deck_premadeDecks;
  "deck/usecases/grantPremadeDeck": typeof deck_usecases_grantPremadeDeck;
  decks: typeof decks;
  friends: typeof friends;
  games: typeof games;
  gifts: typeof gifts;
  init: typeof init;
  lobbies: typeof lobbies;
  "lobby/usecases/setupLobbyGame": typeof lobby_usecases_setupLobbyGame;
  matchmaking: typeof matchmaking;
  ping: typeof ping;
  "shared/container": typeof shared_container;
  "shared/entity": typeof shared_entity;
  "shared/eventEmitter": typeof shared_eventEmitter;
  usecase: typeof usecase;
  "users/username": typeof users_username;
  "utils/email": typeof utils_email;
  "utils/error": typeof utils_error;
  "utils/password": typeof utils_password;
  "utils/randomString": typeof utils_randomString;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
