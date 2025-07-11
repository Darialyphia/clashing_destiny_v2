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
  SUMMONING_SICKNESS: {
    id: 'summoning-sickness',
    name: 'Summoning Sickness',
    description: 'This unit cannot attack or use abilities the turn it is played.',
    aliases: []
  },
  TAUNT: {
    id: 'taunt',
    name: 'Taunt',
    description: 'Enemies must target this when declaring an attack.',
    aliases: ['Taunted']
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
    aliases: []
  },
  ON_ATTACK: {
    id: 'on-attack',
    name: 'On Attack',
    description: 'Does something when this card declares an attack.',
    aliases: []
  },
  ON_BLOCK: {
    id: 'on-block',
    name: 'On Block',
    description: 'Does something when this card declares a block.',
    aliases: []
  },
  ON_HIT: {
    id: 'on-hit',
    name: 'On Hit',
    description: 'Does something when this card deals combat damage.',
    aliases: []
  },
  ON_KILL: {
    id: 'on-kill',
    name: 'On Kill',
    description: 'Does something when this card kills another unit via combat.',
    aliases: []
  },
  UNIQUE: {
    id: 'unique',
    name: 'Unique',
    description: 'You can only have one copy of this card in your deck.',
    aliases: []
  },
  LINEAGE_BONUS: {
    id: 'lineage-bonus',
    name: 'Lineage Bonus',
    description: 'This card has a bonus effect if you have this hero in your lineage.',
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
      "This minion cannot attack, block or use abilities unless its owner's hero is at least level X.",
    aliases: [/pride\([0-9]+\)/]
  },
  LOYALTY: {
    id: 'loyalty',
    name: 'Loyalty(X)',
    description:
      'If you play this minion without having unlocked its affinity, your hero takes X more damage.',
    aliases: [/loyalty\([0-9]+\)/]
  },
  VIGILANT: {
    id: 'vigilant',
    name: 'Vigilant',
    description: 'This unit does not exhaust when blocking.',
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
      'When this minion is attacked  for the first time in a turn, it moves to a adjacent position if possible (prioritizing the left). When it does, prevent all combat damage that would be dealt to and dealt by this creature.',
    aliases: []
  },
  RUSH: {
    id: 'rush',
    name: 'Rush',
    description: 'This unit can attack the turn it is played.',
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
  PUSHER: {
    id: 'pusher',
    name: 'Pusher',
    description:
      'When this unit deals combat damage to a minion, move that minion to the Defense Zone.',
    aliases: []
  },
  DRIFTER: {
    id: 'drifter',
    name: 'Drifter',
    description: "This unit switches zone at th start of its owner's truncate, if able.",
    aliases: []
  },
  BLITZ: {
    id: 'blitz',
    name: 'Blitz',
    description:
      'This unit cannot be blocked. When attacked, its owner cannot declare a block.',
    aliases: []
  },
  PULLER: {
    id: 'puller',
    name: 'Puller',
    description:
      'When this unit declares an attack, move the attack target to the Attack Zone.',
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
  ATTACKER: {
    id: 'attacker',
    name: 'Attacker',
    description: 'This effects is applied if this card is played in the Attack zone.',
    aliases: []
  },
  DEFENDER: {
    id: 'defender',
    name: 'Defender',
    description: 'This effects is applied if this card is played in the Defense zone.',
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
    name: 'Scry(X)',
    description:
      'Look at the top X cards of your deck, then ut any number of them at the bottom of your deck.',
    aliases: [/scry [0-9]+/]
  },
  AFFINITY_BONUS: {
    id: 'affinity-bonus',
    name: 'Affinity Bonus',
    description: 'This card has a bonus effect if you have a hero with this affinity.',
    aliases: [/affinity bonus\([a-z\s]+\)/]
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
      'The first time this deals combat damage during your turn, wake up this minion.',
    aliases: []
  }
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
