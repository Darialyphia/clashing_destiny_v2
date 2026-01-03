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
    aliases: [/^loyalty [0-9]+/]
  },
  FORESIGHT: {
    id: 'foresight',
    name: 'Foresight',
    description:
      'You can banish this card from your Discard pile, to banish a card in your Destiny Zone. Reduce the cost of the next Destiny card you play this turn by 1.',
    aliases: []
  },
  LINGERING_DESTINY: {
    id: 'lingering-destiny',
    name: 'Lingering Destiny',
    description:
      'When this is sent to the discard pile, add a Mana Spark into your Destiny Zone.',
    aliases: []
  },
  CONSUME: {
    id: 'consume',
    name: 'Consume',
    description: 'Destroy the mentioned runes.',
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
  ON_BLOCK: {
    id: 'on-block',
    name: 'On Block',
    description: 'Does something when this card declares a block.',
    aliases: ['on minion block', 'on hero block']
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
      'Does something when this card kills another unit by combat while being the attacker.',
    aliases: []
  },
  ON_LEVEL_UP: {
    id: 'on-level-up',
    name: 'On Level Up',
    description: 'Does something when your hero levels up.',
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
      "This minion cannot attack, retaliate or use abilities unless its owner's hero is at least level X.",
    aliases: [/pride [0-9]+/]
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
    description:
      "This unit has 0 attack and doesn't exhaust at the start of the next turn.",
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
    name: 'Scry X',
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
    description: 'This unit cannot be blocked by minions that cost X or less.',
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
    description: 'The next spell you cast this turn has + X Spellpower.',
    aliases: [/empower [0-9]+/, 'empower', /empowered/]
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
    aliases: [/^lock$/]
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit can attack the turn it is played.',
    aliases: []
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
  }
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
