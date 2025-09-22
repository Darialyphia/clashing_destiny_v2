import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  CARD_BEFORE_PLAY: 'card.before_play',
  CARD_AFTER_PLAY: 'card.after_play',
  CARD_BEFORE_PLAY_WITHOUT_AFFINITY_MATCH: 'card.before_play_without_affinity_match',
  CARD_AFTER_PLAY_WITHOUT_AFFINITY_MATCH: 'card.after_play_without_affinity_match',
  CARD_DISCARD: 'card.discard',
  CARD_ADD_TO_HAND: 'card.add_to_hand',
  CARD_EXHAUST: 'card.exhaust',
  CARD_WAKE_UP: 'card.wake_up',
  CARD_LEAVE_BOARD: 'card.leave_board',
  CARD_BEFORE_DESTROY: 'card.before_destroy',
  CARD_AFTER_DESTROY: 'card.after_destroy',
  CARD_DECLARE_PLAY: 'card.declare_play'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_DECK_SOURCES = {
  MAIN_DECK: 'mainDeck',
  DESTINY_DECK: 'destinyDeck'
} as const;
export type CardDeckSource = Values<typeof CARD_DECK_SOURCES>;

export const CARD_KINDS = {
  MINION: 'MINION',
  HERO: 'HERO',
  // LOCATION: 'LOCATION',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const ARTIFACT_KINDS = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  RELIC: 'RELIC'
} as const;
export type ArtifactKind = Values<typeof ARTIFACT_KINDS>;

export const CARD_SPEED = {
  SLOW: 'SLOW',
  FAST: 'FAST',
  FLASH: 'FLASH'
  // WARP: 'WARP'
} as const;
export type CardSpeed = Values<typeof CARD_SPEED>;

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
  EARTH: 'EARTH',
  AIR: 'AIR',
  ARCANE: 'ARCANE',
  LIGHT: 'LIGHT',
  DARK: 'DARK'
} as const;

export type Affinity = Values<typeof AFFINITIES>;

export const TAGS = {
  SWORD: 'sword'
} as const;
export type Tag = Values<typeof TAGS>;
