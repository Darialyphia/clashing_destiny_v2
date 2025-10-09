import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const friendSchemas = {
  friendRequests: defineTable({
    senderId: v.id('users'),
    receiverId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined')),
    seen: v.boolean()
  })
    .index('by_user_id', ['receiverId', 'senderId'])
    .index('by_sender_id', ['senderId']),

  friendlyChallenges: defineTable({
    challengerId: v.id('users'),
    challengedId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('accepted'), v.literal('declined')),
    challengerDeckId: v.optional(v.id('decks')),
    challengedDeckId: v.optional(v.id('decks')),
    gameId: v.optional(v.id('games')),
    options: v.optional(
      v.object({
        disableTurnTimers: v.boolean(),
        teachingMode: v.boolean()
      })
    )
  })
    .index('by_challenger_id', ['challengerId'])
    .index('by_challenged_id', ['challengedId'])
    .index('by_user_id', ['challengerId', 'challengedId']),

  friendMessages: defineTable({
    friendRequestId: v.id('friendRequests'),
    userId: v.id('users'),
    text: v.string(),
    readAt: v.optional(v.number())
  }).index('by_friend_request_id', ['friendRequestId'])
};
