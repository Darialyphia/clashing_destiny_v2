import { defineSchema } from 'convex/server';

import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';
import { matchmakingSchemas } from './matchmaking/matchmaking.schemas';
import { deckSchemas } from './deck/deck.schemas';
import { gameSchemas } from './game/game.schemas';
import { cardSchemas } from './card/card.schema';

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...matchmakingSchemas,
  ...deckSchemas,
  ...gameSchemas,
  ...cardSchemas
});
