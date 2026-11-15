import {
  isDeckFactionId,
  isEligibleForDeckFaction,
  type DeckFactionId,
  type FactionId
} from '@game/engine/src/card/factions/factions';

/**
 * Gives a faction to a deck that was built before decks had one.
 * It is taken from the first card of the deck that has one (Locations and Neutral cards are skipped),
 * then every card that doesn't fit it is removed.
 * Returns null when no card has a faction: the deck can't get a meaningful one.
 */
export const resolveLegacyDeckFaction = <T>(
  cards: Array<{ entry: T; factionId: FactionId | null }>
): { factionId: DeckFactionId; entries: T[] } | null => {
  const factionId = cards.map(card => card.factionId).find(isDeckFactionId);
  if (!factionId) return null;

  return {
    factionId,
    entries: cards
      .filter(card => isEligibleForDeckFaction(card, factionId))
      .map(card => card.entry)
  };
};
