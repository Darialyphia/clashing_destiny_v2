import { defineSchema } from 'convex/server';
// import { userSchemas } from './convex/users/user.schemas';
// import { matchmakingSchemas } from './convex/matchmaking/matchmaking.schemas';
// import { gameSchemas } from './convex/game/game.schemas';

import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';

export default defineSchema({
  ...authSchemas,
  ...userSchemas
  // ...matchmakingSchemas,
  // ...gameSchemas
});
