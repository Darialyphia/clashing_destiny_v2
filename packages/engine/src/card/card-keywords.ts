import { type Values } from '@game/shared';
import { JOBS, type JobId } from './card.enums';

export type Keyword = {
  id: string;
  name: string;
  description: string;
  aliases: (string | RegExp)[];
};

export const KEYWORDS = {
  ASSIST: {
    id: 'assist',
    name: 'Assist X',
    description:
      'When an ally attacks, you can exhaust this to give the attacking minion +X Power until the end of combat.',
    aliases: [/assist [0-9]+/]
  },
  ATTACKER: {
    id: 'attacker',
    name: 'Attacker X',
    description: 'This unit has +X power when attacking.',
    aliases: [/attacker [0-9]+/]
  },
  BLAST: {
    id: 'blast',
    name: 'Blast X',
    description:
      'When this dies in a battlefield, deal X damage to a minion in the same battlefield.',
    aliases: [/blast [0-9]+/]
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
    description: 'You do not lose initiative after this minion attacks.',
    aliases: []
  },
  CELERITY: {
    id: 'celerity',
    name: 'Celerity',
    description: 'You do not lose initiative after this minion moves.',
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
  FLEETING: {
    id: 'fleeting',
    name: 'Fleeting',
    description:
      'This card disappears at the end of the turn if it is in your hand. It cannot be used to pay for a mana cost.',
    aliases: []
  },
  FLANKING: {
    id: 'flanking',
    name: 'Flanking',
    description: 'This minion can move between battlefields.',
    aliases: []
  },
  INTIMIDATE: {
    id: 'intimidate',
    name: 'Intimidate X',
    description: 'This unit cannot be attacked by minions that cost X or less.',
    aliases: [/intimidate [0-9]+/]
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
  ON_MOVE: {
    id: 'on-move',
    name: 'On Move',
    description: 'Does something when this card moves.',
    aliases: ['on move to base', 'on move to battlefield']
  },
  ON_SCORE: {
    id: 'on-score',
    name: 'On Score',
    description: 'Does something when you win a round on a battlefield this is on.',
    aliases: []
  },
  ON_STRIKE: {
    id: 'on-strike',
    name: 'On Strike',
    description: 'Does something when this card wins a combat.',
    aliases: []
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
  PROTECTOR: {
    id: 'protector',
    name: 'Protector',
    description:
      'Enemies on the same battlefield as this can only attack this unit if able.',
    aliases: []
  },
  REGENERATION: {
    id: 'regeneration',
    name: 'Regeneration X',
    description: 'At the start of the turn, heal this unit for X.',
    aliases: [/regeneration [0-9]+/]
  },
  ROOTED: {
    id: 'rooted',
    name: 'Rooted',
    description: 'This unit cannot move or be moved by any effect.',
    aliases: []
  },
  RUSH: {
    id: 'rush',
    name: 'Rush X',
    description: 'You may pay X to wake up this minion when it is summoned.',
    aliases: [/rush [0-9]+/]
  },
  SACRIFICE: {
    id: 'sacrifice',
    name: 'Sacrifice',
    description:
      "When a minion is sacrificed, its owner doesn't lose HP equal to its Bounty.",
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
  STUNNED: {
    id: 'stunned',
    name: 'Stunned',
    description: 'This unit is exhausted and has 0 damage until the end of the turn.',
    aliases: ['Stun']
  },
  TAUNT: {
    id: 'taunt',
    name: 'Taunt',
    description:
      'Enemy units on the same battlefield as this must attack this unit if able.',
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
  VULNERABLE: {
    id: 'vulnerable',
    name: 'Vulnerable X',
    description: 'This unit takes X more damage from all sources.',
    aliases: [/vulnerable [0-9]+/]
  },
  WITHER: {
    id: 'wither',
    name: 'Wither X',
    description: 'At the start of the turn, this unit loses X Power.',
    aliases: [/wither [0-9]+/]
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
