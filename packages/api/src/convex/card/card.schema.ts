import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const cardSchemas = {
  cards: defineTable({
    blueprintId: v.string(),
    ownerId: v.id('users'),
    copiesOwned: v.number(),
    isFoil: v.boolean()
  })
    .index('by_blueprint_id', ['blueprintId'])
    .index('by_owner_id', ['ownerId'])
    .index('by_owner_id_blueprint_id', ['ownerId', 'blueprintId', 'isFoil'])
};
