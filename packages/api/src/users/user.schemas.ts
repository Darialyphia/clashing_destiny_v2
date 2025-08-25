import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const userSchemas = {
  users: defineTable({
    email: v.string(),
    name: v.string(),
    discriminator: v.string(),
    slug: v.string(),
    passwordHash: v.string(),
    mmr: v.number()
  })
    .index('by_fullname', ['name', 'discriminator'])
    .index('by_slug', ['slug'])
    .index('by_email', ['email'])
};
