import type { Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ADAPT: {
    id: 'adapt',
    name: 'Adapt',
    description: 'When you play this card, choose one of multiple possible effects.',
    aliases: []
  },
  ANCHORED: {
    id: 'anchored',
    name: 'Anchored',
    description: 'This unit cannot move or be moved by any effect.',
    aliases: []
  },
  BACKSTAB: {
    id: 'backstab',
    name: 'Backstab (x)',
    description:
      'When this unit attacks a damaged enemy, it deals X additional damage and is immune to retaliation.',
    aliases: [/^backstab$/, /backstab \([0-9]+\)/]
  },
  BURST: {
    id: 'burst',
    name: 'Burst',
    description: 'You do not lose initiative after playing this card.',
    aliases: []
  },
  SHIELD: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next time this would be damaged.',
    aliases: []
  },
  BLAST: {
    id: 'blast',
    name: 'Blast',
    description: 'When this attacks, this damages all enemies on the same column.',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn (x)',
    description: 'This unit takes X damage at the start of each turn.',
    aliases: [/burn \([0-9]+\)/]
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description:
      'Can move and attack in the same turn, and does not pass initiative after moving.',
    aliases: []
  },
  CLEANSE: {
    id: 'cleanse',
    name: 'Cleanse',
    description: 'Remove enchantments previously added from enemy sources.',
    aliases: []
  },
  DEATHWATCH: {
    id: 'deathwatch',
    name: 'Deathwatch',
    description: 'Triggers effect whenever a unit is destroyed.',
    aliases: []
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    description: 'Choose one card between 3 choices and add it to your hand.',
    aliases: []
  },
  ECHO: {
    id: 'echo',
    name: 'Echo',
    description: 'When you play this card, put an Ephemeral copy of it in your hand.',
    aliases: []
  },
  ELUSIVE: {
    id: 'elusive',
    name: 'Elusive',
    description:
      'When this unit is attacked for the first time in a turn, it moves to a adjacent position on the same rowif possible  (favor left). When it does, prevent all combat damage that would be dealt to and dealt by this creature.',
    aliases: []
  },
  EPHEMERAL: {
    id: 'ephemeral',
    name: 'Ephemeral',
    description: "This disappears at the end of its owner's turn.",
    aliases: []
  },
  ESSENCE: {
    id: 'essence',
    name: 'Essence',
    description:
      "If you don't have enough mana, you can play this minion as a spell by paying its essence cost instead.",
    aliases: [/essence\([0-9]+\)/]
  },
  FEARSOME: {
    id: 'fearsome',
    name: 'Fearsome (x)',
    description:
      "When this unit attacks a minino that costs X or less, it doesn't counterattack.",
    aliases: [/fearsome \([0-9]+\)/]
  },
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description:
      "This card is removed from the game at the end of your turn if it's in your hand.",
    aliases: []
  },
  CLEAVE: {
    id: 'cleave',
    name: 'Cleave',
    description:
      'When attacking, deal its attack damage to adjacent enemies on the same row.',
    aliases: ['frenzy']
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description: 'This unit does not wake up at the start of the next turn.',
    aliases: ['freeze']
  },
  GROW: {
    id: 'grow',
    name: 'Grow',
    description: 'This unit gains attack and hp at the starts of its turn.',
    aliases: []
  },

  INTIMIDATE: {
    id: 'intimidate',
    name: 'Intimidate (x)',
    description: 'Cannot be attacked by enemies that cost x or less.',
    aliases: [/intimidate \([0-9]+\)/]
  },
  INVULNERABLE: {
    id: 'invulnerable',
    name: 'Invulnerable',
    description: 'This unit cannot be damaged.',
    aliases: []
  },
  LEVEL_BONUS: {
    id: 'level-bonus',
    name: 'Level X Bonus',
    description: "This card has a bonus effect if its owner's Hero is at least level X.",
    aliases: [/level [0-9] bonus/]
  },
  LONE_WOLF: {
    id: 'lone_wolf',
    name: 'Lone wolf',
    description: 'Triggers when this unit has no nearby allies.',
    aliases: []
  },
  ON_DESTROYED: {
    id: 'on_destroyed',
    name: 'On Destroyed',
    description: 'Triggers when the unit is destroyed.',
    aliases: ['dying wish']
  },
  ON_ATTACK: {
    id: 'on_attack',
    name: 'On Attack',
    description: 'Triggers when this unit attacks.',
    aliases: ['on minion attack', 'on player attack']
  },
  ON_COUNTERATTACK: {
    id: 'on_counterattack',
    name: 'On Counterattack',
    description: 'Triggers when this unit counterattacks.',
    aliases: []
  },
  ON_ENTER: {
    id: 'on_enter',
    name: 'On Enter',
    description: 'Triggers when the unit enters the battlefield.',
    aliases: []
  },
  PROVOKE: {
    id: 'provoke',
    name: 'Provoke',
    description:
      'Enemies in the same column as this cannot move and can only attack this unit.',
    aliases: ['provoke']
  },
  PROVOKED: {
    id: 'provoked',
    name: 'Provoked',
    description: 'Provoked - cannot move and must attack Provoker first.',
    aliases: []
  },
  SHOOTER: {
    id: 'shooter',
    name: 'Shooter',
    description: 'This unit is immune to retaliation from non shooter units.',
    aliases: []
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit activates the turn it is summoned.',
    aliases: []
  },
  STRUCTURE: {
    id: 'structure',
    name: 'Structure',
    aliases: [],
    description: 'Cannot move, attack, retaliate or gain attack.'
  },
  SUMMONING_SICKNESS: {
    id: 'summoning_sickness',
    name: 'Summoning Sickness',
    description: 'This unit was summoned this turn and cannot act.',
    aliases: []
  },
  MAGIC_GUARD: {
    id: 'magic_guard',
    name: 'Magic Guard',
    description: 'Cannot be targeted by spells',
    aliases: []
  },
  ZEAL: {
    id: 'zeal',
    name: 'Zeal',
    description: 'Triggers an effect when an adjacent ally has attacked this turn.',
    aliases: []
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description: 'Cannot be targeted or attacked unless exhausted.',
    aliases: []
  },
  UNIQUE: {
    id: 'unique',
    name: 'Unique',
    description:
      'Only one copy of this card can be in play on your side of the board at a time.',
    aliases: []
  },
  MELEE_GUARD: {
    id: 'melee_guard',
    name: 'Melee Guard (x)',
    description: 'Adjacent allies take X less damage from melee minions.',
    aliases: [/melee guard \([0-9]+\)/]
  },
  RANGED_GUARD: {
    id: 'ranged_guard',
    name: 'Ranged Guard (x)',
    description: 'Adjacent allies take X less damage from ranged minions.',
    aliases: [/ranged guard \([0-9]+\)/]
  },
  FLYER_GUARD: {
    id: 'flyer_guard',
    name: 'Flyer Guard (x)',
    description: 'Adjacent allies take X less damage from flyer minions.',
    aliases: [/flyer guard \([0-9]+\)/]
  },
  HERO_GUARD: {
    id: 'hero_guard',
    name: 'Hero Guard (x)',
    description: 'Adjacent allies take X less damage from enemy heroes.',
    aliases: [/hero guard \([0-9]+\)/]
  },
  EMPOWER: {
    id: 'empower',
    name: 'Empower X',
    description: 'The next spell you cast this turn deals X more damage.',
    aliases: [/empower [0-9]+/, 'empower', /empowered/]
  }
} as const satisfies Record<string, Keyword>;

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
