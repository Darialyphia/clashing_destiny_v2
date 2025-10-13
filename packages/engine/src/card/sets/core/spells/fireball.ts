import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const fireball: SpellBlueprint = {
  id: 'fireball',
  name: 'Fireball',
  cardIconId: 'spells/fireball',
  description: 'Deal 4 damage to target enemy minions and all adjacent minions.',
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
  tags: [],
  canPlay: singleEnemyTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleEnemyTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;

    const adjacentMinions = target.slot!.adjacentMinions;
    await target.takeDamage(card, new SpellDamage(4, card));
    for (const minion of adjacentMinions) {
      await minion.takeDamage(card, new SpellDamage(4, card));
    }
  }
};
