import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { GIFT_SOURCES, GIFT_STATES } from './gift.constants';

export const giftSchemas = {
  gifts: defineTable({
    receiverId: v.id('users'),
    state: v.union(
      v.literal(GIFT_STATES.ISSUED),
      v.literal(GIFT_STATES.CLAIMED),
      v.literal(GIFT_STATES.REVOKED)
    ),
    name: v.string(),
    openedAt: v.optional(v.number()),
    source: v.union(
      v.literal(GIFT_SOURCES.PROMOTION),
      v.literal(GIFT_SOURCES.COMPENSATION),
      v.literal(GIFT_SOURCES.EVENT),
      v.literal(GIFT_SOURCES.SEASON_REWARD),
      v.literal(GIFT_SOURCES.SIGNUP_GIFT),
      v.literal(GIFT_SOURCES.REFERRAL)
    ),
    contents: v.array(
      v.union(
        v.object({
          kind: v.literal('DECK'),
          deckId: v.id('decks')
        }),
        v.object({
          kind: v.literal('CARDS'),
          cards: v.array(
            v.object({
              blueprintID: v.string(),
              isFoil: v.boolean(),
              amount: v.number()
            })
          )
        })
      )
    )
  })
};
