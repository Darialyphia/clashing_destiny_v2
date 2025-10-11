import type { Values } from '@game/shared';

export const GIFT_STATES = {
  ISSUED: 'ISSUED',
  CLAIMED: 'CLAIMED',
  REVOKED: 'REVOKED'
} as const;
export type GiftState = Values<typeof GIFT_STATES>;

export const GIFT_SOURCES = {
  PROMOTION: 'PROMOTION',
  COMPENSATION: 'COMPENSATION',
  EVENT: 'EVENT',
  SEASON_REWARD: 'SEASON_REWARD',
  SIGNUP_GIFT: 'SIGNUP_GIFT',
  REFERRAL: 'REFERRAL'
} as const;
export type GiftSource = Values<typeof GIFT_SOURCES>;

export const GIFT_KINDS = {
  DECK: 'DECK',
  CARDS: 'CARDS'
} as const;
export type GiftKind = Values<typeof GIFT_KINDS>;
