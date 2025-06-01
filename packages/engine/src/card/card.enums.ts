import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  CARD_BEFORE_PLAY: 'card.before_play',
  CARD_AFTER_PLAY: 'card.after_play',
  CARD_DISCARD: 'card.discard',
  CARD_ADD_TO_HAND: 'card.add_to_hand',
  CARD_EXHAUST: 'card.exhaust',
  CARD_WAKE_UP: 'card.wake_up',
  CARD_LEAVE_BOARD: 'card.leave_board',
  CARD_BEFORE_DESTROY: 'card.before_destroy',
  CARD_AFTER_DESTROY: 'card.after_destroy'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_DECK_SOURCES = {
  MAIN_DECK: 'MAIN_DECK',
  DESTINY_DECK: 'DESTINY_DECK'
} as const;
export type CardDeckSource = Values<typeof CARD_DECK_SOURCES>;

export const CARD_KINDS = {
  MINION: 'MINION',
  HERO: 'HERO',
  LOCATION: 'LOCATION',
  SPELL: 'SPELL',
  ATTACK: 'ATTACK',
  ARTIFACT: 'ARTIFACT',
  TALENT: 'TALENT'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const SPELL_KINDS = {
  CAST: 'CAST',
  BURST: 'BURST'
} as const;
export type SpellKind = Values<typeof SPELL_KINDS>;

export const ARTIFACT_KINDS = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  RELIC: 'RELIC'
} as const;
export type ArtifactKind = Values<typeof ARTIFACT_KINDS>;

export const CARD_SETS = {
  CORE: 'CORE'
} as const;

export type CardSetId = Values<typeof CARD_SETS>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;

export const AFFINITIES = {
  NORMAL: 'NORMAL',
  FIRE: 'FIRE',
  WATER: 'WATER',
  FROST: 'FROST',
  EARTH: 'EARTH',
  WIND: 'WIND',
  STORM: 'STORM',
  VOID: 'VOID',
  ARCANE: 'ARCANE',
  BLOOD: 'BLOOD',
  HOLY: 'HOLY',
  SHADOW: 'SHADOW',
  NATURE: 'NATURE',
  DEATH: 'DEATH',
  COSMIC: 'COSMIC',
  CHRONO: 'CHRONO',
  CHAOS: 'CHAOS',
  TECH: 'TECH',
  PRIMAL: 'PRIMAL',
  ARMS: 'ARMS'
} as const;

export type Affinity = Values<typeof AFFINITIES>;
