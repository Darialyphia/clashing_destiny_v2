import { type Values } from '@game/shared';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  LINEAGE: {
    id: 'lineage',
    name: 'Lineage',
    description:
      'This Hero must be leveled up from a previous hero with the same lineage.',
    aliases: [/^[a-z\s]+\slineage+/]
  },
  LOYALTY: {
    id: 'loyalty',
    name: 'Loyalty X',
    description:
      'If this card is from a different faction than your hero, Deal X additional unpreventable damage to your hero when you play it.',
    aliases: [/^loyalty [0-9]+/, 'loyalty']
  },
  LINGERING_DESTINY: {
    id: 'lingering-destiny',
    name: 'Lingering Destiny',
    description:
      'You can banish this card from your discard pile to add a Mana Spark to your hand.',
    aliases: []
  },
  SUMMONING_SICKNESS: {
    id: 'summoning-sickness',
    name: 'Summoning Sickness',
    description: 'This unit cannot move the turn it is played.',
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
  ON_KILL: {
    id: 'on-kill',
    name: 'On Kill',
    description:
      'Does something when this card kills another unit by combat while being the attacker.',
    aliases: []
  },
  ON_LEVEL_UP: {
    id: 'on-level-up',
    name: 'On Level Up',
    description: 'Does something when your hero levels up.',
    aliases: []
  },
  ON_RETREAT: {
    id: 'on-retreat',
    name: 'On Retreat',
    description: 'Does something when this card moves from the battlefield to the base.',
    aliases: []
  },
  ON_ENGAGE: {
    id: 'on-engage',
    name: 'On Engage',
    description: 'Does something when this card moves from the base to the battlefield.',
    aliases: []
  },
  IN_BASE: {
    id: 'in-base',
    name: 'In Base',
    description: 'Does something while this card is in base.',
    aliases: []
  },
  IN_BATTLEFIELD: {
    id: 'in-battlefield',
    name: 'In Battlefield',
    description: 'Does something while this card is in the battlefield.',
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
    aliases: [/lineage bonus [0-9]+/]
  },
  LEVEL_BONUS: {
    id: 'level-bonus',
    name: 'Level X Bonus',
    description: "This card has a bonus effect if its owner's Hero is at least level X.",
    aliases: [/level [0-9] bonus/]
  },
  PRIDE: {
    id: 'pride',
    name: 'Pride X',
    description:
      "This minion cannot attack, move, or use abilities unless its owner's hero is at least level X.",
    aliases: [/pride [0-9]+/]
  },
  HINDERED: {
    id: 'hindered',
    name: 'Hindered X',
    description: 'This card comes into play exhausted unless you pay X.',
    aliases: [/^hindered [0-9]+$/, 'hindered']
  },
  PROTECTOR: {
    id: 'protector',
    name: 'Protector',
    description: 'Enemy units cannot attack other minions without Protector',
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
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      "This unit has 0 attack and doesn't wake up at the start of the next turn.",
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
    name: 'Burn X',
    description: 'This takes X damage at the start of every turn.',
    aliases: [/burn [0-9]+/]
  },
  INFLUENCE: {
    id: 'influence',
    name: 'Influence',
    description: 'The sum of the cards in your hand and Destiny zone.',
    aliases: []
  },
  SCRY: {
    id: 'scry',
    name: 'Scry X',
    description:
      'Look at the top X cards of your deck, then put any number of them at the bottom of your deck.',
    aliases: [/scry [0-9]+/]
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: "All of this card's activated abilities are Sealed.",
    aliases: ['silence']
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
  BALANCE: {
    id: 'balance',
    name: 'Balance',
    description: 'You have the same amount of cards in your hand and your Destiny zone.',
    aliases: []
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough X',
    description: 'This minion takes X less damage from all sources.',
    aliases: [/tough [0-9]+/]
  },
  MILL: {
    id: 'mill',
    name: 'Mill (X)',
    description: 'Send the top X cards of your deck to the discard pile.',
    aliases: [/mill [0-9]+/]
  },
  INTIMIDATE: {
    id: 'intimidate',
    name: 'Intimidate X',
    description: 'This unit cannot be attacked by minions that cost X or less.',
    aliases: [/intimidate [0-9]+/]
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
    aliases: [/spellpower [0-9]+/, 'spellpower']
  },
  EMPOWER: {
    id: 'empower',
    name: 'Empower X',
    description: 'The next spell you cast this turn deals X more damage.',
    aliases: [/empower [0-9]+/, 'empower', /empowered/]
  },
  LOCKED: {
    id: 'locked',
    name: 'Locked',
    description:
      'This card cannot be played. If it is in the Destiny Zone, it is not recollected at the start of the turn.',
    aliases: [/^lock$/]
  },
  BLAST: {
    id: 'blast',
    name: 'Blast X',
    description: 'When this card is destroyed in combat, deal X damage to an enemy.',
    aliases: [/blast [0-9]+/]
  },
  PREEMPTIVE_STRIKE: {
    id: 'preemptive-strike',
    name: 'Preemptive Strike',
    description:
      'This unit deals its combat damage before the defending unit during combat.',
    aliases: []
  },
  PREEMPTIVE_RETALIATION: {
    id: 'preemptive-retaliation',
    name: 'Preemptive Retaliation',
    description:
      'This unit deals its combat damage before the attacking unit during combat.',
    aliases: []
  },
  TRUE_DAMAGE: {
    id: 'true-damage',
    name: 'True Damage',
    description:
      'This damage cannot be prevented or reduced, and is not affected by Spellpower.',
    aliases: []
  },
  SPELLBOOST: {
    id: 'spellboost',
    name: 'Spellboost',
    description:
      'When you play a spell, the Spellboost effects of cards in your hand activate. Effects vary by card',
    aliases: []
  },
  BURST_ATTACK: {
    id: 'burst-attack',
    name: 'Burst Attack',
    description: "This unit's owner keeps initiativer after this unit attacks.",
    aliases: []
  },
  COURAGE: {
    id: 'courage',
    name: 'Courage X',
    description: 'This unit has +X attack when attacking.',
    aliases: [/courage [0-9]+/]
  },
  STEADFAST: {
    id: 'steadfast',
    name: 'Steadfast X',
    description: 'This unit has +X attack when getting attacked.',
    aliases: [/steadfast [0-9]+/]
  },
  CHALLENGE: {
    id: 'challenge',
    name: 'Challenge',
    description: 'Move a minino from the base to the battlefield',
    aliases: []
  }
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
