import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { CURRENCY_SOURCES, CURRENCY_TYPES } from './currency.constants';

export const CURRENCY_TRANSACTION_TYPE_VALIDATOR = v.literal(CURRENCY_TYPES.GOLD);

export const CURRENCY_SOURCE_VALIDATOR = v.union(
  v.literal(CURRENCY_SOURCES.ADMIN_GRANT),
  v.literal(CURRENCY_SOURCES.ACHIEVEMENT),
  v.literal(CURRENCY_SOURCES.DAILY_LOGIN),
  v.literal(CURRENCY_SOURCES.GAME_PARTICIPATION),
  v.literal(CURRENCY_SOURCES.GAME_VICTORY),
  v.literal(CURRENCY_SOURCES.QUEST_COMPLETION),
  v.literal(CURRENCY_SOURCES.SEASON_REWARD),
  v.literal(CURRENCY_SOURCES.SPEND)
);

export const currencySchemas = {
  wallets: defineTable({
    userId: v.id('users'),
    gold: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user', ['userId']),

  currencyTransactions: defineTable({
    userId: v.id('users'),
    currencyType: CURRENCY_TRANSACTION_TYPE_VALIDATOR,
    amount: v.number(),
    balanceBefore: v.number(),
    balanceAfter: v.number(),
    source: CURRENCY_SOURCE_VALIDATOR,
    sourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number()
  })
    .index('by_user', ['userId'])
    .index('by_user_currency', ['userId', 'currencyType'])
    .index('by_user_created', ['userId', 'createdAt'])
    .index('by_source', ['source', 'sourceId'])
};
