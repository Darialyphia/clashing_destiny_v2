import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { BOOSTER_PACK_STATUS, BOOSTER_PACKS_CATALOG } from './card.constants';

export const CARD_SET_VALIDATOR = v.union(
  v.literal(BOOSTER_PACKS_CATALOG.CORE_STANDARD.id)
);
export const BOOSTER_STATUS_VALIDATOR = v.union(
  v.literal(BOOSTER_PACK_STATUS.PENDING),
  v.literal(BOOSTER_PACK_STATUS.OPENED)
);

export const cardSchemas = {
  cards: defineTable({
    blueprintId: v.string(),
    ownerId: v.id('users'),
    copiesOwned: v.number(),
    isFoil: v.boolean()
  })
    .index('by_blueprint_id', ['blueprintId'])
    .index('by_owner_id', ['ownerId'])
    .index('by_owner_id_blueprint_id', ['ownerId', 'blueprintId', 'isFoil']),

  boosterPacks: defineTable({
    ownerId: v.id('users'),
    packType: CARD_SET_VALIDATOR,
    status: BOOSTER_STATUS_VALIDATOR,
    acquiredAt: v.number(),
    openedAt: v.optional(v.number()),
    content: v.array(
      v.object({
        blueprintId: v.string(),
        isFoil: v.boolean()
      })
    )
  })
    .index('by_owner_id', ['ownerId'])
    .index('by_owner_id_status', ['ownerId', 'status'])
};
