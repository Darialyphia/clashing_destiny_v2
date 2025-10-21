import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { SpellCard } from '../../../entities/spell.entity';

export const stoicOverlord: MinionBlueprint = {
  id: 'stoic-overlord',
  name: 'Stoic Overlord',
  cardIconId: 'minions/stoic-overlord',
  description: dedent`
  When your hero takes damage, this give this unit +2 @[attack]@ this turn.
  @On Attack@ : You may have this unit deal 3 damage to your hero.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {},
  async onPlay() {}
};
