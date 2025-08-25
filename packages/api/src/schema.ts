import { defineSchema } from 'convex/server';
// import { gameSchemas } from './convex/game/game.schemas';

import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';
import { matchmakingSchemas } from './matchmaking/matchmaking.schemas';

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...matchmakingSchemas
  // ...gameSchemas
});
