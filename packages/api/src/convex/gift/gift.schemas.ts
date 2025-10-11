import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { GIFT_SOURCES, GIFT_STATES } from './gift.constants';

export const GIFT_CONTENTS_VALIDATOR = v.array(
  v.union(
    v.object({
      kind: v.literal('DECK'),
      deckId: v.string()
    }),
    v.object({
      kind: v.literal('CARDS'),
      cards: v.array(
        v.object({
          blueprintId: v.string(),
          isFoil: v.boolean(),
          amount: v.number()
        })
      )
    })
  )
);

export const GIFT_SOURCE_VALIDATOR = v.union(
  v.literal(GIFT_SOURCES.PROMOTION),
  v.literal(GIFT_SOURCES.COMPENSATION),
  v.literal(GIFT_SOURCES.EVENT),
  v.literal(GIFT_SOURCES.SEASON_REWARD),
  v.literal(GIFT_SOURCES.SIGNUP_GIFT),
  v.literal(GIFT_SOURCES.REFERRAL)
);
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
    source: GIFT_SOURCE_VALIDATOR,
    contents: GIFT_CONTENTS_VALIDATOR
  }).index('by_receiver_id', ['receiverId'])
};
