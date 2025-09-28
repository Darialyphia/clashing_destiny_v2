import type { Values } from '@game/shared';

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
  ECHOED_DESTINY: {
    id: 'echoed-destiny',
    name: 'Echoed Destiny',
    description:
      'The first time you play this card, when this card is sent to the graveyard, put it into your Destiny Zone instead.',
    aliases: []
  },
  SUMMONING_SICKNESS: {
    id: 'summoning-sickness',
    name: 'Summoning Sickness',
    description: 'This unit cannot attack or use abilities the turn it is played.',
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
    description: 'After it counterattacks, wake up this unit.',
    aliases: []
  },
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description: 'This card is banished at the end of your turn if it is in your hand.',
    aliases: []
  },
  ELUSIVE: {
    id: 'elusive',
    name: 'Elusive',
    description:
      'The first time this minion is attacked each turn, it moves to a adjacent position on the same row if possible (prioritizing down). When it does, prevent all combat damage that would be dealt to and dealt by this creature.',
    aliases: []
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      "This unit is exhausted and will not wake up during its owner's the next turn.",
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
  CLEAVE: {
    id: 'cleave',
    name: 'Cleave',
    description:
      'Damages minions to the right and to the left of the target as well when attacking.',
    aliases: []
  },
  PIERCING: {
    id: 'piercing',
    name: 'Piercing',
    description: 'Damages the minion behind the target when attacking.',
    aliases: []
  },
  SCRY: {
    id: 'scry',
    name: 'Scry (X)',
    description:
      'Look at the top X cards of your deck, then put any number of them at the bottom of your deck.',
    aliases: [/scry [0-9]+/]
  },
  AFFINITY_BONUS: {
    id: 'affinity-bonus',
    name: 'Affinity Bonus',
    description: 'This card has a bonus effect if you have a hero with this affinity.',
    aliases: [/affinity bonus \([a-z\s]+\)/]
  },
  FIRE_AFFINITY: {
    id: 'fire-affinity',
    name: 'Fire Affinity',
    description: 'This card has a bonus effect if your hero has the Fire spell school.',
    aliases: []
  },
  WATER_AFFINITY: {
    id: 'water-affinity',
    name: 'Water Affinity',
    description: 'This card has a bonus effect if your hero has the Water spell school.',
    aliases: []
  },
  EARTH_AFFINITY: {
    id: 'earth-affinity',
    name: 'Earth Affinity',
    description: 'This card has a bonus effect if your hero has the Earth spell school.',
    aliases: []
  },
  AIR_AFFINITY: {
    id: 'air-affinity',
    name: 'Air Affinity',
    description: 'This card has a bonus effect if your hero has the Air spell school.',
    aliases: []
  },
  LIGHT_AFFINITY: {
    id: 'light-affinity',
    name: 'Light Affinity',
    description: 'This card has a bonus effect if your hero has the Light spell school.',
    aliases: []
  },
  DARK_AFFINITY: {
    id: 'dark-affinity',
    name: 'Dark Affinity',
    description: 'This card has a bonus effect if your hero has the Dark spell school.',
    aliases: []
  },
  ARCANE_AFFINITY: {
    id: 'arcane-affinity',
    name: 'Arcane Affinity',
    description: 'This card has a bonus effect if your hero has the Arcane spell school.',
    aliases: []
  },
  SEAL: {
    id: 'seal',
    name: 'Seal',
    description: 'This ability cannot be used.',
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
  TRAP: {
    id: 'trap',
    name: 'Trap',
    description:
      'This card is not recollected after your Destiny Phase and is sent to the discard pile instead. If the condition is met while this card is in your Destiny zone, it is played for free.',
    aliases: []
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
  }
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
