import { defineSchema } from 'convex/server';

import { authSchemas } from './auth/auth.schema';
import { userSchemas } from './users/user.schemas';
import { matchmakingSchemas } from './matchmaking/matchmaking.schemas';
import { deckSchemas } from './deck/deck.schemas';
import { gameSchemas } from './game/game.schemas';
import { cardSchemas } from './card/card.schema';
import { friendSchemas } from './friend/friend.schemas';
import { lobbySchemas } from './lobby/lobby.schemas';
import { giftSchemas } from './gift/gift.schemas';

export default defineSchema({
  ...authSchemas,
  ...userSchemas,
  ...matchmakingSchemas,
  ...deckSchemas,
  ...gameSchemas,
  ...cardSchemas,
  ...friendSchemas,
  ...lobbySchemas,
  ...giftSchemas
});
