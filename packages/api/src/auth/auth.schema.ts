import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const authSchemas = {
  authSessions: defineTable({
    userId: v.id('users'),
    secretHash: v.string(),
    expirationTime: v.number()
  }).index('userId', ['userId'])
};
