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

export const fireBolt: SpellBlueprint = {
  id: 'fire-bolt',
  name: 'Fire Bolt',
  cardIconId: 'spells/fire-bolt',
  description:
    'Deal 1 damage to target enemy. If the target is a minion, deal 1 damage to the enemy Hero.',
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FAST,
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
    await target.takeDamage(card, new SpellDamage(1, card));
    if (isMinion(target)) {
      const enemyHero = target.player.hero;
      await enemyHero.takeDamage(card, new SpellDamage(1, card));
    }
  }
};
