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
import type * as index from "../index.js";
import type * as matchmaking_index from "../matchmaking/index.js";
import type * as shared_entity from "../shared/entity.js";
import type * as usecase from "../usecase.js";
import type * as utils_discriminator from "../utils/discriminator.js";
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
  index: typeof index;
  "matchmaking/index": typeof matchmaking_index;
  "shared/entity": typeof shared_entity;
  usecase: typeof usecase;
  "utils/discriminator": typeof utils_discriminator;
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
