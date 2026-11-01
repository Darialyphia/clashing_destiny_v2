import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userSchemas = {
  users: defineTable({
    email: v.string(),
    username: v.string(),
    slug: v.string(),
    passwordHash: v.string(),
    mmr: v.number()
  })
    .index('by_username', ['username'])
    .index('by_slug', ['slug'])
    .index('by_email', ['email']),

  userSettings: defineTable({
    userId: v.id('users'),
    settings: v.any(),
    version: v.number()
  }).index('by_user_id', ['userId'])
};
