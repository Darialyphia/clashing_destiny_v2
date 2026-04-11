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
  CARD_DECLARE_USE_ABILITY: 'card.declare_use_ability',
  CARD_BEFORE_DEAL_COMBAT_DAMAGE: 'card.before_deal_combat_damage',
  CARD_AFTER_DEAL_COMBAT_DAMAGE: 'card.after_deal_combat_damage',
  CARD_BEFORE_CHANGE_LOCATION: 'card.before_change_location',
  CARD_AFTER_CHANGE_LOCATION: 'card.after_change_location',
  CARD_BEFORE_TAKE_DAMAGE: 'card.before_take_damage',
  CARD_AFTER_TAKE_DAMAGE: 'card.after_take_damage',
  CARD_BEFORE_REVEAL: 'card.before_reveal',
  CARD_AFTER_REVEAL: 'card.after_reveal'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_KINDS = {
  MINION: 'MINION',
  HERO: 'HERO',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT',
  DESTINY: 'DESTINY'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const ARTIFACT_KINDS = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  RELIC: 'RELIC'
} as const;
export type ArtifactKind = Values<typeof ARTIFACT_KINDS>;

export const CARD_SOURCES = {
  MAIN_DECK: 'mainDeck',
  DESTINY_DECK: 'destinyDeck'
} as const;
export type CardSource = Values<typeof CARD_SOURCES>;

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

export type Job = {
  id: string;
  name: string;
  shortName: string;
  isAdvanced: boolean;
};

export const JOBS = {
  NEUTRAL: {
    id: 'neutral',
    name: 'Neutral',
    shortName: 'Neu',
    isAdvanced: false
  },
  // WARRIOR: {
  //   id: 'warrior',
  //   name: 'Warrior',
  //   shortName: 'War',
  //   isAdvanced: false
  // },
  MAGE: {
    id: 'mage',
    name: 'Mage',
    shortName: 'Mag',
    isAdvanced: false
  }
  // ROGUE: {
  //   id: 'rogue',
  //   name: 'Rogue',
  //   shortName: 'Rog',
  //   isAdvanced: false
  // },
  // ACOLYTE: {
  //   id: 'acolyte',
  //   name: 'Acolyte',
  //   shortName: 'Aco',
  //   isAdvanced: true
  // },
  // RANGER: {
  //   id: 'ranger',
  //   name: 'Ranger',
  //   shortName: 'Ran',
  //   isAdvanced: true
  // },
  // WITCH: {
  //   id: 'witch',
  //   name: 'Witch',
  //   shortName: 'Wit',
  //   isAdvanced: true
  // },
  // ALCHEMIST: {
  //   id: 'alchemist',
  //   name: 'Alchemist',
  //   shortName: 'Alc',
  //   isAdvanced: true
  // },
  // ELEMENTALIST: {
  //   id: 'elementalist',
  //   name: 'Elementalist',
  //   shortName: 'Ele',
  //   isAdvanced: true
  // },
  // BERZERKER: {
  //   id: 'berzerker',
  //   name: 'Berzerker',
  //   shortName: 'Ber',
  //   isAdvanced: true
  // },
  // PALADIN: {
  //   id: 'paladin',
  //   name: 'Paladin',
  //   shortName: 'Pal',
  //   isAdvanced: true
  // },
  // NECROMANCER: {
  //   id: 'necromancer',
  //   name: 'Necromancer',
  //   shortName: 'Nec',
  //   isAdvanced: true
  // },
  // DRUID: {
  //   id: 'druid',
  //   name: 'Druid',
  //   shortName: 'Dru',
  //   isAdvanced: true
  // },
  // ASSASSIN: {
  //   id: 'assassin',
  //   name: 'Assassin',
  //   shortName: 'Ass',
  //   isAdvanced: true
  // },
  // STALKER: {
  //   id: 'stalker',
  //   name: 'Stalker',
  //   shortName: 'Sta',
  //   isAdvanced: true
  // },
  // BOUNTY_HUNTER: {
  //   id: 'bounty_hunter',
  //   name: 'Bounty Hunter',
  //   shortName: 'Bou',
  //   isAdvanced: true
  // }
} as const satisfies Record<string, Job>;
export type JobId = Values<typeof JOBS>['id'];

export const CARD_LOCATIONS = {
  HAND: 'hand',
  MAIN_DECK: 'mainDeck',
  DESTINY_DECK: 'destinyDeck',
  DISCARD_PILE: 'discardPile',
  BANISH_PILE: 'banishPile',
  BOARD: 'board'
} as const;
export type CardLocation = Values<typeof CARD_LOCATIONS>;

export const defaultCardTint: CardTint = {
  colors: ['#FFFFFF', '#FFFFFF'],
  mode: { type: 'radial' },
  blendMode: 'overlay',
  opacity: 0
};
