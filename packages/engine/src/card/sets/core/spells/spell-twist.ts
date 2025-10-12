import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const spellTwist: SpellBlueprint = {
  id: 'spell-twist',
  name: 'Spell Twist',
  cardIconId: 'spells/spell-twist',
  description:
    'Add a copy of the last spell played by your opponent to your hand. Ignore its spell school requirements',
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.FLASH,
  spellSchool: SPELL_SCHOOLS.ARCANE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {}
};
