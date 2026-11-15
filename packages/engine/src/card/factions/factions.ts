import type { Values } from '@game/shared';

export const FACTION_IDS = {
  LYONAR: 'LYONAR',
  SONGHAI: 'SONGHAI',
  VETRUVIAN: 'VETRUVIAN',
  ABYSSIAN: 'ABYSSIAN',
  MAGMAR: 'MAGMAR',
  VANAR: 'VANAR',
  NEUTRAL: 'NEUTRAL'
} as const;

export type FactionId = Values<typeof FACTION_IDS>;

export type Faction = {
  id: FactionId;
  name: string;
};

export const FACTIONS: Record<FactionId, Faction> = {
  [FACTION_IDS.LYONAR]: { id: FACTION_IDS.LYONAR, name: 'Lyonar' },
  [FACTION_IDS.SONGHAI]: { id: FACTION_IDS.SONGHAI, name: 'Songhai' },
  [FACTION_IDS.VETRUVIAN]: { id: FACTION_IDS.VETRUVIAN, name: 'Vetruvian' },
  [FACTION_IDS.ABYSSIAN]: { id: FACTION_IDS.ABYSSIAN, name: 'Abyssian' },
  [FACTION_IDS.MAGMAR]: { id: FACTION_IDS.MAGMAR, name: 'Magmar' },
  [FACTION_IDS.VANAR]: { id: FACTION_IDS.VANAR, name: 'Vanar' },
  [FACTION_IDS.NEUTRAL]: { id: FACTION_IDS.NEUTRAL, name: 'Neutral' }
};

// a deck is built around one of these: every faction except Neutral
export type DeckFactionId = Exclude<FactionId, typeof FACTION_IDS.NEUTRAL>;

export const DECK_FACTION_IDS = Object.values(FACTION_IDS).filter(
  (id): id is DeckFactionId => id !== FACTION_IDS.NEUTRAL
);

export const isDeckFactionId = (id: unknown): id is DeckFactionId =>
  DECK_FACTION_IDS.includes(id as DeckFactionId);

// display order: factions in declaration order, Neutral last
export const FACTION_ORDER = Object.fromEntries(
  Object.values(FACTION_IDS).map((id, index) => [id, index])
) as Record<FactionId, number>;

/**
 * Whether a card can be put in a deck of the given faction.
 * Neutral cards and cards without a faction (Locations) fit in every deck.
 */
export const isEligibleForDeckFaction = (card: object, deckFactionId: FactionId) => {
  const factionId = 'factionId' in card ? (card.factionId as FactionId | null) : null;

  return !factionId || factionId === FACTION_IDS.NEUTRAL || factionId === deckFactionId;
};
