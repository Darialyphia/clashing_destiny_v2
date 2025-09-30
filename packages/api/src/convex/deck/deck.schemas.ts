import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const deckSchemas = {
  decks: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    mainDeck: v.array(
      v.object({
        blueprintId: v.string()
      })
    ),
    destinyDeck: v.array(
      v.object({
        blueprintId: v.string()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
