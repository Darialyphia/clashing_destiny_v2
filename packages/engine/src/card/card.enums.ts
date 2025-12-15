import type { Values } from '@game/shared';
import { DESTRUCTION } from 'dns';

export const CARD_EVENTS = {
  CARD_BEFORE_PLAY: 'card.before_play',
  CARD_AFTER_PLAY: 'card.after_play',
  CARD_DISCARD: 'card.discard',
  CARD_ADD_TO_HAND: 'card.add_to_hand',
  CARD_EXHAUST: 'card.exhaust',
  CARD_WAKE_UP: 'card.wake_up',
  CARD_LEAVE_BOARD: 'card.leave_board',
  CARD_BEFORE_DESTROY: 'card.before_destroy',
  CARD_AFTER_DESTROY: 'card.after_destroy',
  CARD_DISPOSED: 'card.disposed',
  CARD_EFFECT_TRIGGERED: 'card.effect_triggered',
  CARD_DECLARE_PLAY: 'card.declare_play',
  CARD_DECLARE_USE_ABILITY: 'card.declare_use_ability',
  CARD_BEFORE_DEAL_COMBAT_DAMAGE: 'card.before_deal_combat_damage',
  CARD_AFTER_DEAL_COMBAT_DAMAGE: 'card.after_deal_combat_damage',
  CARd_BEFORE_CHANGE_ZONE: 'card.before_change_zone',
  CARD_AFTER_CHANGE_ZONE: 'card.after_change_zone'
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
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT',
  SIGIL: 'SIGIL'
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

export const TAGS = {
  SWORD: 'sword'
} as const;
export type Tag = Values<typeof TAGS>;

export type CardTint = {
  colors: string[];
  mode:
    | {
        type: 'linear';
        angle: number;
      }
    | {
        type: 'radial';
      };
  blendMode: 'multiply' | 'screen' | 'overlay' | 'hard-light' | 'soft-light' | 'color';
  opacity: number;
};

export type Faction = {
  id: string;
  name: string;
  defaultCardTint: CardTint;
};
export const FACTIONS = {
  NEUTRAL: {
    id: 'neutral',
    name: 'Neutral',
    defaultCardTint: {
      colors: ['#FFFFFF', '#FFFFFF'],
      mode: { type: 'radial' },
      blendMode: 'overlay',
      opacity: 0
    }
  },
  ORDER: {
    id: 'order',
    name: 'Order',
    defaultCardTint: {
      colors: ['#FFD700', '#FFA500'],
      mode: { type: 'linear', angle: 45 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  CHAOS: {
    id: 'chaos',
    name: 'Chaos',
    defaultCardTint: {
      colors: ['#8B0000', '#FF4500'],
      mode: { type: 'linear', angle: 45 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  HARMONY: {
    id: 'harmony',
    name: 'Harmony',
    defaultCardTint: {
      colors: ['#006400', '#32CD32'],
      mode: { type: 'linear', angle: 45 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  DESTRUCTION: {
    id: 'destruction',
    name: 'Destruction',
    defaultCardTint: {
      colors: ['#708090', '#A9A9A9'],
      mode: { type: 'linear', angle: 45 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  ARCANE: {
    id: 'arcane',
    name: 'Arcane',
    defaultCardTint: {
      colors: ['#4B0082', '#8A2BE2'],
      mode: { type: 'linear', angle: 45 },
      blendMode: 'overlay',
      opacity: 1
    }
  }
} as const satisfies Record<string, Faction>;
export type FactionId = Values<typeof FACTIONS>['id'];

export const RUNES = {
  MIGHT: 'POWER',
  KNOWLEDGE: 'KNOWLEDGE',
  COURAGE: 'COURAGE',
  FOCUS: 'FOCUS'
} as const;
export type Rune = Values<typeof RUNES>;
