import { defineTable } from 'convex/server';
import { v, type Validator } from 'convex/values';
import type { SpellSchool } from '@game/engine/src/card/card.enums';

export const deckSchemas = {
  decks: defineTable({
    name: v.string(),
    ownerId: v.id('users'),
    spellSchools: v.array(v.string()) as Validator<SpellSchool[]>,
    mainDeck: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    ),
    destinyDeck: v.array(
      v.object({
        cardId: v.id('cards'),
        copies: v.number()
      })
    )
  }).index('by_owner_id', ['ownerId'])
};
