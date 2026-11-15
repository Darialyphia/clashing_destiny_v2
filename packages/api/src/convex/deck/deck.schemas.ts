import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { FACTION_IDS } from '@game/engine/src/card/factions/factions';

// every faction except Neutral
export const DECK_FACTION_VALIDATOR = v.union(
  v.literal(FACTION_IDS.LYONAR),
  v.literal(FACTION_IDS.SONGHAI),
  v.literal(FACTION_IDS.VETRUVIAN),
  v.literal(FACTION_IDS.ABYSSIAN),
  v.literal(FACTION_IDS.MAGMAR),
  v.literal(FACTION_IDS.VANAR)
);

export const deckSchemas = {
  decks: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    // always set for new decks, optional only until the setDeckFactions migration has run everywhere
    factionId: v.optional(DECK_FACTION_VALIDATOR),
    cards: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
