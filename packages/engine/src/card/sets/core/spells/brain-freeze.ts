import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { isMinion, multipleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { LockedeModifier } from '../../../../modifier/modifiers/locked.modifier';

export const brainFreeze: SpellBlueprint = {
  id: 'brain-freeze',
  name: 'Brain Freeze',
  cardIconId: 'spells/brain-freeze',
  description: dedent`
  @Lock@ the 2 most expensive cards in the opponent Destiny Zone.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit() {},
  async onPlay(game, card) {
    const cardsToLock = Array.from(card.player.opponent.cardManager.destinyZone)
      .sort((a, b) => b.manaCost - a.manaCost)
      .slice(0, 2);

    for (const targetCard of cardsToLock) {
      await targetCard.modifiers.add(new LockedeModifier(game, card, { duration: 2 }));
    }
  }
};
