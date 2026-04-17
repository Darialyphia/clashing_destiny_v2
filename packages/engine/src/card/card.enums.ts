import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  CARD_BEFORE_PLAY: 'card.before_play',
  CARD_AFTER_PLAY: 'card.after_play',
  CARD_DISCARD: 'card.discard',
  CARD_ADD_TO_HAND: 'card.add_to_hand'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_KINDS = {
  MINION: 'MINION',
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT',
  DESTINY: 'DESTINY',
  HERO: 'HERO'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

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
  GOLEM: 'Golem',
  ARCANYST: 'Arcanyst',
  MECH: 'Mech',
  OBELYSK: 'Obelysk',
  DERVISH: 'Dervish',
  GENERAL: 'General'
} as const;
export type Tag = Values<typeof TAGS>;

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
    shortName: 'Neutral',
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
    shortName: 'Mage',
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
export const getJobById = (id: JobId): Job | undefined => {
  return Object.values(JOBS).find(job => job.id === id);
};

export const RUNES = {
  RED: 'red',
  BLUE: 'blue',
  YELLOW: 'yellow'
} as const;
export type Rune = Values<typeof RUNES>;

export const CARD_LOCATIONS = {
  HAND: 'hand',
  DECK: 'deck',
  DISCARD_PILE: 'discardPile',
  BOARD: 'board'
} as const;
export type CardLocation = Values<typeof CARD_LOCATIONS>;
