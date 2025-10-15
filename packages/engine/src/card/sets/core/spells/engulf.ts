import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
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

export const engulfInFlames: SpellBlueprint = {
  id: 'engulf-in-flames',
  name: 'Engulf in Flames',
  cardIconId: 'spells/engulf-in-flames',
  description:
    'Deal 3 damage to target enemy. If the target is a minion, give it @Burn@.',
  collectable: true,
  unique: false,
  manaCost: 3,
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
    await target.takeDamage(card, new SpellDamage(1, card));
    if (isMinion(target)) {
      await target.modifiers.add(new BurnModifier(game, card));
    }
  }
};
