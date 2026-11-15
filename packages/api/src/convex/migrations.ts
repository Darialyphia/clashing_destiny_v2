import { Migrations } from '@convex-dev/migrations';
import { components, internal } from './_generated/api';
import schema from './schema';
import { CARD_SETS, RARITIES } from '@game/engine/src/card/card.enums';
import { cardsBySet } from '@game/engine/src/generated/cards';
import { GIFT_KINDS, GIFT_STATES } from './gift/gift.constants';
import { BOOSTER_PACK_STATUS } from './card/card.constants';
import { resolveLegacyDeckFaction } from './deck/deck.utils';

export const migrations = new Migrations(components.migrations, { schema });

export const setPremiumCurrency = migrations.define({
  table: 'wallets',
  migrateOne: async (ctx, doc) => {
    if (doc.premiumCurrency === undefined) {
      await ctx.db.patch(doc._id, { premiumCurrency: 0 });
    }
  }
});

export const setDefaultGiftIcon = migrations.define({
  table: 'gifts',
  migrateOne: async (ctx, doc) => {
    if (doc.icon === undefined) {
      await ctx.db.patch(doc._id, { icon: 'gift-default' });
    }
  }
});

// Rune cards have been removed from the game.
// Includes the legacy rune blueprint ids in case some old cards are still lying around.
const REMOVED_RUNE_BLUEPRINT_IDS = new Set([
  'light-affinity',
  'fire-affinity',
  'air-affinity',
  'rune_of_air',
  'rune_of_dark',
  'rune_of_earth',
  'rune_of_enigma',
  'rune_of_fire',
  'rune_of_focus',
  'rune_of_light',
  'rune_of_might',
  'rune_of_resonance',
  'rune_of_water',
  'rune_of_wisdom'
]);

// Needs to run before removeRuneCards, as it reads the cards to know their blueprint.
// Entries pointing to a card that no longer exists are dropped as well,
// so that the result is correct even if the migrations run out of order.
export const removeRuneCardsFromDecks = migrations.define({
  table: 'decks',
  migrateOne: async (ctx, deck) => {
    const cards = [];
    for (const entry of deck.cards) {
      const card = await ctx.db.get(entry.cardId);
      if (!card || REMOVED_RUNE_BLUEPRINT_IDS.has(card.blueprintId)) continue;
      cards.push(entry);
    }

    if (cards.length !== deck.cards.length) {
      await ctx.db.patch(deck._id, { cards });
    }
  }
});

export const removeRuneCards = migrations.define({
  table: 'cards',
  migrateOne: async (ctx, card) => {
    if (REMOVED_RUNE_BLUEPRINT_IDS.has(card.blueprintId)) {
      await ctx.db.delete(card._id);
    }
  }
});

// Gifts that have not been claimed yet would grant rune cards when opened.
// A gift left with nothing to grant is revoked.
export const removeRuneCardsFromUnclaimedGifts = migrations.define({
  table: 'gifts',
  migrateOne: async (ctx, gift) => {
    if (gift.state !== GIFT_STATES.ISSUED) return;

    let hasChanged = false;
    const contents = gift.contents.flatMap((content): typeof gift.contents => {
      if (content.kind !== GIFT_KINDS.CARDS) return [content];

      const cards = content.cards.filter(
        card => !REMOVED_RUNE_BLUEPRINT_IDS.has(card.blueprintId)
      );
      if (cards.length === content.cards.length) return [content];

      hasChanged = true;
      return cards.length > 0 ? [{ ...content, cards }] : [];
    });

    if (!hasChanged) return;

    await ctx.db.patch(gift._id, {
      contents,
      state: contents.length > 0 ? gift.state : GIFT_STATES.REVOKED
    });
  }
});

// Booster packs contents are rolled when they are bought.
// Rune cards in unopened packs are replaced by another common card, so the pack keeps its size.
export const replaceRuneCardsInUnopenedBoosterPacks = migrations.define({
  table: 'boosterPacks',
  migrateOne: async (ctx, pack) => {
    if (pack.status !== BOOSTER_PACK_STATUS.PENDING) return;
    if (!pack.content.some(card => REMOVED_RUNE_BLUEPRINT_IDS.has(card.blueprintId))) {
      return;
    }

    const commons = cardsBySet[CARD_SETS.CORE]
      .filter(card => card.collectable && card.rarity === RARITIES.COMMON)
      .map(card => card.id);
    const pickedIds = new Set(pack.content.map(card => card.blueprintId));

    const content = pack.content.map(card => {
      if (!REMOVED_RUNE_BLUEPRINT_IDS.has(card.blueprintId)) return card;

      const available = commons.filter(id => !pickedIds.has(id));
      const pool = available.length > 0 ? available : commons;
      const blueprintId = pool[Math.floor(Math.random() * pool.length)];
      pickedIds.add(blueprintId);

      return { ...card, blueprintId };
    });

    await ctx.db.patch(pack._id, { content });
  }
});

const BLUEPRINT_FACTIONS = new Map(
  Object.values(cardsBySet)
    .flat()
    .map(card => [card.id, card.factionId])
);

// Decks now have a faction, see resolveLegacyDeckFaction.
// Decks without any faction card can't get a meaningful faction, so they are deleted.
export const setDeckFactions = migrations.define({
  table: 'decks',
  migrateOne: async (ctx, deck) => {
    if (deck.factionId) return;

    const cards = [];
    for (const entry of deck.cards) {
      const card = await ctx.db.get(entry.cardId);
      // entries pointing to a card that no longer exists are dropped
      if (!card) continue;
      cards.push({ entry, factionId: BLUEPRINT_FACTIONS.get(card.blueprintId) ?? null });
    }

    const resolved = resolveLegacyDeckFaction(cards);

    if (!resolved) {
      // a player queued with this deck would otherwise point to a deck that no longer exists
      const queueEntries = await ctx.db
        .query('matchmakingUsers')
        .filter(q => q.eq(q.field('deckId'), deck._id))
        .collect();
      for (const queueEntry of queueEntries) {
        await ctx.db.delete(queueEntry._id);
      }
      await ctx.db.delete(deck._id);
      return;
    }

    await ctx.db.patch(deck._id, {
      factionId: resolved.factionId,
      cards: resolved.entries
    });
  }
});

export const runAll = migrations.runner([
  internal.migrations.setPremiumCurrency,
  internal.migrations.setDefaultGiftIcon,
  internal.migrations.removeRuneCardsFromDecks,
  internal.migrations.removeRuneCards,
  internal.migrations.removeRuneCardsFromUnclaimedGifts,
  internal.migrations.replaceRuneCardsInUnopenedBoosterPacks,
  internal.migrations.setDeckFactions
]);
