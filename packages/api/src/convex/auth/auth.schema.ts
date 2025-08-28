import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authSchemas = {
  authSessions: defineTable({
    userId: v.id('users'),
    expirationTime: v.number(),
    lastVerifiedAt: v.number()
  }).index('userId', ['userId'])
};
