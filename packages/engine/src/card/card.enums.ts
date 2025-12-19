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
  BURST: 'BURST'
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
  shortName: string;
  defaultCardTint: CardTint;
};
export const FACTIONS = {
  NEUTRAL: {
    id: 'NEUTRAL',
    name: 'Neutral',
    shortName: 'Neutr',
    defaultCardTint: {
      colors: ['#FFFFFF', '#FFFFFF'],
      mode: { type: 'radial' },
      blendMode: 'overlay',
      opacity: 0
    }
  },
  ORDER: {
    id: 'ORDER',
    name: 'Order',
    shortName: 'Order',
    defaultCardTint: {
      colors: ['#FFD700', '#45A5dd'],
      mode: { type: 'linear', angle: 135 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  CHAOS: {
    id: 'CHAOS',
    name: 'Chaos',
    shortName: 'Chaos',
    defaultCardTint: {
      mode: { type: 'linear', angle: 135 },
      colors: ['#483D8B', '#7E2042'],
      blendMode: 'overlay',
      opacity: 1
    }
  },
  GENESIS: {
    id: 'GENESIS',
    name: 'Genesis',
    shortName: 'Genesis',
    defaultCardTint: {
      colors: ['#0064a9', '#a2dd92'],
      mode: { type: 'linear', angle: 135 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  OBLIVION: {
    id: 'OBLIVION',
    name: 'Oblivion',
    shortName: 'Obliv',
    defaultCardTint: {
      colors: ['#8B0064', '#aa2442'],
      mode: { type: 'linear', angle: 135 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  ARCANE: {
    id: 'ARCANE',
    name: 'Arcane',
    shortName: 'Arcane',
    defaultCardTint: {
      colors: ['#cc0081', '#006ab6'],
      mode: { type: 'linear', angle: 135 },
      blendMode: 'overlay',
      opacity: 1
    }
  },
  PRIMAL: {
    id: 'primal',
    name: 'Primal',
    shortName: 'Primal',
    defaultCardTint: {
      colors: ['#8B4513', '#DEB887'],
      mode: { type: 'linear', angle: 135 },
      blendMode: 'overlay',
      opacity: 1
    }
  }
} as const satisfies Record<string, Faction>;
export type FactionId = Values<typeof FACTIONS>['id'];

export const RUNES = {
  MIGHT: 'MIGHT',
  KNOWLEDGE: 'KNOWLEDGE',
  FOCUS: 'FOCUS'
  // RESONANCE: 'RESONANCE'
} as const;
export type Rune = Values<typeof RUNES>;
