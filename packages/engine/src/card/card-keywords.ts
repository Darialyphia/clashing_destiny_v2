import { uppercaseFirstLetter, type Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

type ToAffinityKeywordKey<T extends string> = `${Uppercase<T>}_AFFINITY`;

export const KEYWORDS = {
  LINEAGE: {
    id: 'lineage',
    name: 'Lineage',
    description:
      'This Hero must be leveled up from a previous hero with the same lineage.',
    aliases: [/^[a-z\s]+\slineage+/]
  },
  ECHOED_DESTINY: {
    id: 'echoed-destiny',
    name: 'Echoed Destiny',
    description:
      'If this card is banished while paying for the cost of a Destiny card, add it to your hand instead and give it Fleeting.',
    aliases: []
  },
  LINGERING_DESTINY: {
    id: 'lingering-destiny',
    name: 'Lingering Destiny',
    description:
      'You can banish this card from your Discard pile to add a Mana Spark into your Destiny Zone.',
    aliases: []
  },
  CONSUME: {
    id: 'consume',
    name: 'Consume',
    description: 'Destroy the mentioned runes when this card is played.',
    aliases: []
  },
  SUMMONING_SICKNESS: {
    id: 'summoning-sickness',
    name: 'Summoning Sickness',
    description: 'This unit cannot attack the turn it is played.',
    aliases: []
  },
  ON_ENTER: {
    id: 'on-enter',
    name: 'On Enter',
    description: 'Does something when this card enters the board when played from hand.',
    aliases: []
  },
  ON_DESTROYED: {
    id: 'on-destroyed',
    name: 'On Destroyed',
    description: 'Does something when this card is destroyed.',
    aliases: ['on death']
  },
  ON_ATTACK: {
    id: 'on-attack',
    name: 'On Attack',
    description: 'Does something when this card declares an attack.',
    aliases: ['on minion attack', 'on hero attack']
  },
  ON_RETALIATE: {
    id: 'on-retaliate',
    name: 'On Retaliate',
    description: 'Does something when this card retaliates.',
    aliases: []
  },
  ON_HIT: {
    id: 'on-hit',
    name: 'On Hit',
    description: 'Does something when this card deals combat damage.',
    aliases: ['on minion hit', 'on hero hit']
  },
  ON_KILL: {
    id: 'on-kill',
    name: 'On Kill',
    description:
      'Does something when this card kills another unit via combat while being the attacker.',
    aliases: []
  },
  ON_LEVEL_UP: {
    id: 'on-level-up',
    name: 'On Level Up',
    description: 'Does something when this hero levels up.',
    aliases: []
  },
  UNIQUE: {
    id: 'unique',
    name: 'Unique',
    description: 'You can only have one copy of this card on the board at the same time.',
    aliases: []
  },
  LINEAGE_BONUS: {
    id: 'lineage-bonus',
    name: 'Lineage Bonus',
    description: 'This card has a bonus effect if this is your hero.',
    aliases: [/lineage bonus\([a-z\s]\)/]
  },
  LEVEL_BONUS: {
    id: 'level-bonus',
    name: 'Level X Bonus',
    description: "This card has a bonus effect if its owner's Hero is at least level X.",
    aliases: [/level [0-9] bonus/]
  },
  PRIDE: {
    id: 'pride',
    name: 'Pride(X)',
    description:
      "This minion cannot attack, retaliate or use abilities unless its owner's hero is at least level X.",
    aliases: [/pride \([0-9]+\)/]
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'After this blocks, wake up this unit.',
    aliases: []
  },
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description:
      'This card disappears at the end of the turn if it is in your hand. It cannot be used to pay for a mana cost.',
    aliases: []
  },
  ECHO: {
    id: 'echo',
    name: 'Echo',
    description:
      'When you play this card, add it to your hand as a Fleeting copy of it without Echo.',
    aliases: []
  },
  EFFICIENCY: {
    id: 'efficiency',
    name: 'Efficiency',
    description: 'This card costs X less to play where X is your Hero level.',
    aliases: [/efficiency \([0-9]+\)/]
  },
  ATTACKER: {
    id: 'attacker',
    name: 'Attacker',
    description: 'Gain a bonus while in the attack zone.',
    aliases: []
  },
  DEFENDER: {
    id: 'defender',
    name: 'Defender',
    description: 'Gain a bonus while in the defense zone.',
    aliases: []
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description: "Exhaust this unit. it doesn't exhaust at the start of the next turn.",
    aliases: ['Freeze']
  },
  INHERITED_EFFECT: {
    id: 'inherited-effect',
    name: 'Inherited Effect',
    description: 'This effect is preserved when your hero levels up.',
    aliases: []
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    description: 'pick one card among three choices to add to your hand.',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn',
    description: 'This takes 1 damage at the start of every turn.',
    aliases: []
  },
  INFLUENCE: {
    id: 'influence',
    name: 'Influence',
    description: 'The sum of the cards in your hand and Destiny zone.',
    aliases: []
  },
  SCRY: {
    id: 'scry',
    name: 'Scry (X)',
    description:
      'Look at the top X cards of your deck, then put any number of them at the bottom of your deck.',
    aliases: [/scry [0-9]+/]
  },
  SEAL: {
    id: 'seal',
    name: 'Seal',
    description: 'Once sealed, this ability can no longer be used.',
    aliases: []
  },
  DOUBLE_ATTACK: {
    id: 'double-attack',
    name: 'Double Attack',
    description:
      'The first time this attacks each turn, wake up this minion after combat.',
    aliases: []
  },
  EMBER: {
    id: 'ember',
    name: 'Ember',
    description: 'Consumed by other cards to gain additional effects.',
    aliases: []
  },
  INTERCEPT: {
    id: 'intercept',
    name: 'Intercept',
    description:
      "When an adjacent ally minion is attacked, at flash speed, you may swap this minion's position with the attack target, and have the attack target this minion instead.",
    aliases: []
  },
  BALANCE: {
    id: 'balance',
    name: 'Balance',
    description: 'You have the same amount of cards in your hand and your Destiny zone.',
    aliases: []
  },
  HERO_INTERCEPT: {
    id: 'hero-intercept',
    name: 'Hero Intercept',
    description:
      'When your hero is attacked, at flash speed, you may redirect the attack to this minion instead.',
    aliases: []
  },
  TRAP: {
    id: 'trap',
    name: 'Trap',
    description:
      'This card is not recollected after your Destiny Phase and is sent to the discard pile instead. If the condition is met while this card is in your Destiny zone, it is played for free.',
    aliases: []
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough (X)',
    description: 'This minion takes X less damage from all sources.',
    aliases: [/tough \([0-9]+\)/]
  },
  RANGED: {
    id: 'ranged',
    name: 'Ranged',
    description:
      'This minion can attack minions in the back row even if they are behind another minion. When attacking from the back-row, non ranged minions cannot counterattack.',
    aliases: []
  },
  MILL: {
    id: 'mill',
    name: 'Mill (X)',
    description: 'Send the top X cards of your deck to the discard pile.',
    aliases: [/mill [0-9]+/]
  },
  INTIMIDATE: {
    id: 'intimidate',
    name: 'Intimidate (X)',
    description:
      'Minions that cost X or less attacked by this cannot counterattack when attacked by this.',
    aliases: [/intimidate \([0-9]+\)/]
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description:
      'This unit cannot be targeted by attacks as long as it is not exhausted.',
    aliases: []
  },
  EQUIP_WEAPON: {
    id: 'equip-weapon',
    name: 'Equip Weapon',
    description: "This turn, your hero gains attack equal to this card's Attack bonus",
    aliases: []
  },
  OVERWHELM: {
    id: 'overwhelm',
    name: 'Overwhelm',
    description:
      'When this attacks and destroy a minion, deal excess damage to the enemy Hero.',
    aliases: []
  },
  SPELLPOWER: {
    id: 'spellpower',
    name: 'Spellpower X',
    description: 'Increase the damage of your spells by X.',
    aliases: [/spellpower \([0-9]+\)/, 'spellpower']
  },
  EMPOWER: {
    id: 'empower',
    name: 'Empower X',
    description:
      'The next Spell you play this turn resolves as if you had +X Spellpower.',
    aliases: [/empower [0-9]+/, 'empower']
  },
  REACTION: {
    id: 'reaction',
    name: 'Reaction',
    description: 'You can only play this card if a card chain is already ongoing.',
    aliases: [/reaction \([0-9]+\)/, 'reaction']
  },
  FLANK: {
    id: 'flank',
    name: 'Flank',
    description: 'This minion can attack minions on adjacent rows.',
    aliases: []
  },
  LOCKED: {
    id: 'locked',
    name: 'Locked',
    description:
      'This card cannot be played. If it is in the Destiny Zone, it is not recollected at the start of the turn.',
    aliases: ['lock']
  }
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
