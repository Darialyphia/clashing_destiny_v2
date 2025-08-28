import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const matchmakingSchemas = {
  matchmaking: defineTable({
    name: v.string(),
    startedAt: v.optional(v.number()),
    nextInvocationId: v.optional(v.id('_scheduled_functions'))
  }),

  matchmakingUsers: defineTable({
    userId: v.id('users'),
    matchmakingId: v.id('matchmaking'),
    deckId: v.id('decks'),
    joinedAt: v.number()
  })
    .index('by_userId', ['userId'])
    .index('by_matchmakingId', ['matchmakingId'])
};
