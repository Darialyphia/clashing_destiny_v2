import { defineTable } from 'convex/server';
import { v } from 'convex/values';

export const deckSchemas = {
  decks: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    cards: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
