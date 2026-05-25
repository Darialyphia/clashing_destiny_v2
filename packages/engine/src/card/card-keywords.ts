import { type Values } from '@game/shared';
import { JOBS, type JobId } from './card.enums';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ANCHORED: {
    id: 'anchored',
    name: 'Anchored',
    description: 'This unit cannot move or be moved by any effect.',
    aliases: []
  },
  ATTACKER: {
    id: 'attacker',
    name: 'Attacker X',
    description: 'This unit has +X attack when attacking.',
    aliases: [/attacker [0-9]+/]
  },
  BLAST: {
    id: 'blast',
    name: 'Blast',
    description: 'When this attacks, this damages all enemies on the same column.',
    aliases: []
  },
  BURN: {
    id: 'burn',
    name: 'Burn X',
    description: 'This takes X damage at the start of every turn.',
    aliases: [/burn [0-9]+/, /burn/]
  },
  BURST: {
    id: 'burst',
    name: 'Burst',
    description: 'You do not lose initiative after playing this card.',
    aliases: []
  },
  BURST_ATTACK: {
    id: 'burst-attack',
    name: 'Burst Attack',
    description: "This unit's owner keeps initiative after this unit attacks.",
    aliases: []
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description:
      'Can move and attack in the same turn, and does not pass initiative after moving.',
    aliases: []
  },
  CHANNEL: {
    id: 'channel',
    name: 'Channel',
    description:
      'At the end of the turn, if this card is not exhausted, this card does something.',
    aliases: [/channel/]
  },
  DEFENDER: {
    id: 'defender',
    name: 'Defender X',
    description: 'This unit has +X attack when counterattacking.',
    aliases: [/defender [0-9]+/]
  },
  DISCOVER: {
    id: 'discover',
    name: 'Discover',
    description: 'pick one card among three choices to add to your hand.',
    aliases: []
  },
  DOUBLE_ATTACK: {
    id: 'double-attack',
    name: 'Double Attack',
    description:
      'The first time this attacks each turn, wake up this minion after combat.',
    aliases: []
  },
  ECHO: {
    id: 'echo',
    name: 'Echo',
    description: 'When you play this card, add a Fleeting copy of it to your hand.',
    aliases: []
  },
  EMPOWER: {
    id: 'empower',
    name: 'Empower X',
    description:
      'The next spell you cast this turn resolves as if your Hero had +X level.',
    aliases: [/empower [0-9]+/, 'empower', /empowered/]
  },
  FEARSOME: {
    id: 'fearsome',
    name: 'Fearsome X',
    description:
      "When this unit attacks a minion that costs X or less, it doesn't counterattack.",
    aliases: [/fearsome [0-9]+/]
  },
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description:
      'This card disappears at the end of the turn if it is in your hand. It cannot be used to pay for a mana cost.',
    aliases: []
  },
  FLYER_GUARD: {
    id: 'flyer_guard',
    name: 'Flyer Guard (x)',
    description: 'Adjacent allies take X less damage from flyer minions.',
    aliases: [/flyer guard \([0-9]+\)/]
  },
  FROZEN: {
    id: 'frozen',
    name: 'Frozen',
    description:
      "This unit has 0 attack and doesn't wake up at the start of the next turn.",
    aliases: ['Freeze']
  },
  INTIMIDATE: {
    id: 'intimidate',
    name: 'Intimidate X',
    description: 'This unit cannot be attacked by minions that cost X or less.',
    aliases: [/intimidate [0-9]+/]
  },
  LEVEL_BONUS: {
    id: 'level-bonus',
    name: 'Level X Bonus',
    description: "This card has a bonus effect if its owner's Hero is at least level X.",
    aliases: [/level [0-9] bonus/]
  },
  LOYALTY: {
    id: 'loyalty',
    name: 'Loyalty X',
    description:
      "This cards costs X more to play if it doesn't share an affinity with your Hero.",
    aliases: [/^loyalty [0-9]+/, 'loyalty']
  },
  MELEE_GUARD: {
    id: 'melee_guard',
    name: 'Melee Guard (x)',
    description: 'Adjacent allies take X less damage from melee minions.',
    aliases: [/melee guard \([0-9]+\)/]
  },
  MILL: {
    id: 'mill',
    name: 'Mill (X)',
    description: 'Send the top X cards of your deck to the discard pile.',
    aliases: [/mill [0-9]+/]
  },
  ON_ATTACK: {
    id: 'on-attack',
    name: 'On Attack',
    description: 'Does something when this card declares an attack.',
    aliases: ['on minion attack', 'on hero attack']
  },
  ON_DESTROYED: {
    id: 'on-destroyed',
    name: 'On Destroyed',
    description: 'Does something when this card is destroyed.',
    aliases: ['on death']
  },
  ON_ENTER: {
    id: 'on-enter',
    name: 'On Enter',
    description: 'Does something when this card enters the board when played from hand.',
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
  ON_RETALIATE: {
    id: 'on-retaliate',
    name: 'On Retaliate',
    description: 'Does something when this card retaliates.',
    aliases: []
  },
  ON_STRIKE: {
    id: 'on-strike',
    name: 'On Strike',
    description: 'Does something when this card deals combat damage to a unit.',
    aliases: ['on minion strike', 'on hero strike']
  },
  OVERWHELM: {
    id: 'overwhelm',
    name: 'Overwhelm',
    description:
      'When this attacks and destroy a minion, deal excess damage to the enemy Hero.',
    aliases: []
  },
  PREDICT: {
    id: 'predict',
    name: 'Predict',
    description:
      'Look at 3 cards from your deck at random, choose one and put it on top of your deck.',
    aliases: []
  },
  PREEMPTIVE_RETALIATION: {
    id: 'preemptive-retaliation',
    name: 'Preemptive Retaliation',
    description:
      'This unit deals its combat damage before the attacking unit during combat.',
    aliases: []
  },
  PREEMPTIVE_STRIKE: {
    id: 'preemptive-strike',
    name: 'Preemptive Strike',
    description:
      'This unit deals its combat damage before the defending unit during combat.',
    aliases: []
  },
  PRIDE: {
    id: 'pride',
    name: 'Pride X',
    description:
      "This minion cannot attack, move, or use abilities unless its owner's hero is at least level X.",
    aliases: [/pride [0-9]+/]
  },
  PROTECTOR: {
    id: 'protector',
    name: 'Protector',
    description:
      'When an adjacent ally takes combat damage, this unit takes that damage instead.',
    aliases: []
  },
  RANGED_GUARD: {
    id: 'ranged_guard',
    name: 'Ranged Guard (x)',
    description: 'Adjacent allies take X less damage from ranged minions.',
    aliases: [/ranged guard \([0-9]+\)/]
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration X',
    description: 'At the start of the turn, heal this unit for X.',
    aliases: [/regeneration [0-9]+/]
  },
  SUMMONING_SICKNESS: {
    id: 'summoning-sickness',
    name: 'Summoning Sickness',
    description: 'This unit cannot move or attack the turn it is played.',
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
  SHIELD: {
    id: 'barrier',
    name: 'Barrier',
    description: 'Prevents the next time this would be damaged.',
    aliases: []
  },
  SILENCED: {
    id: 'silenced',
    name: 'Silenced',
    description: 'This cards loses all abilities.',
    aliases: ['silence']
  },
  SPELL_GUARD: {
    id: 'spell_guard',
    name: 'Spell Guard (x)',
    description: 'Adjacent allies take X less damage from enemy spells.',
    aliases: [/spell guard \([0-9]+\)/]
  },
  SPELLBOOST: {
    id: 'spellboost',
    name: 'Spellboost',
    description:
      'When you play a spell, the Spellboost effects of cards in your hand activate. Effects vary by card',
    aliases: []
  },
  SPELLPOWER: {
    id: 'spellpower',
    name: 'Spellpower X',
    description: 'Increase the damage of your spells by X.',
    aliases: [/spellpower [0-9]+/, 'spellpower']
  },
  SPLASH_ATTACK: {
    id: 'splash_attack',
    name: 'Splash Attack',
    description: 'When this unit attacks, it also damages adjacent units.',
    aliases: []
  },
  STEALTH: {
    id: 'stealth',
    name: 'Stealth',
    description:
      'This unit cannot be targeted by attacks as long as it is not exhausted.',
    aliases: []
  },
  TOUGH: {
    id: 'tough',
    name: 'Tough X',
    description: 'This minion takes X less damage from all sources.',
    aliases: [/tough [0-9]+/]
  },
  TRUE_DAMAGE: {
    id: 'true-damage',
    name: 'True Damage',
    description: 'This damage cannot be prevented or reduced.',
    aliases: []
  },
  UNIQUE: {
    id: 'unique',
    name: 'Unique',
    description: 'You can only have one copy of this card on the board at the same time.',
    aliases: []
  },
  ...Object.fromEntries(
    Object.values(JOBS).map(job => [
      `${job.id.toUpperCase()}_BONUS` as `${Uppercase<JobId>}_BONUS`,
      {
        id: `${job.id}_mastery`,
        name: `${job.name} Bonus`,
        description: `This card has a bonus effect if its owner is playing a ${job.name} hero.`,
        aliases: []
      }
    ]) as [`${Uppercase<JobId>}_BONUS`, Keyword][]
  )
};

export type KeywordName = Values<typeof KEYWORDS>['name'];
export type KeywordId = Values<typeof KEYWORDS>['id'];

export const getKeywordById = (id: KeywordId): Keyword | undefined =>
  Object.values(KEYWORDS).find(k => k.id === id);
