import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleMinionTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const sunburst: SpellBlueprint = {
  id: 'sunburst',
  name: 'Sunburst',
  cardIconId: 'spells/sunburst',
  description: 'Deal 2 damage to an enemy minion or heal an ally minion for 2.',
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FAST,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  tags: [],
  canPlay: singleMinionTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;

    if (target.isAlly(card)) {
      await target.heal(3);
    } else {
      await target.takeDamage(card, new SpellDamage(2));
    }
  }
};
