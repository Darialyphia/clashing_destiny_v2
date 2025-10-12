import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  isMinion,
  singleAllyMinionTargetRules,
  singleEnemyTargetRules
} from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const innerfire: SpellBlueprint = {
  id: 'inner-fire',
  name: 'Inner Fire',
  cardIconId: 'spells/inner-fire',
  description: 'Give an ally minion +2 @[attack]@ this turn.',
  collectable: true,
  unique: false,
  manaCost: 1,
  speed: CARD_SPEED.FLASH,
  spellSchool: SPELL_SCHOOLS.FIRE,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  tags: [],
  canPlay: singleAllyMinionTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit() {},
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;
    await target.modifiers.add(
      new SimpleAttackBuffModifier('inner-fire-buff', game, card, {
        amount: 2,
        name: 'Inner Fire',
        mixins: [new UntilEndOfTurnModifierMixin<MinionCard>(game)]
      })
    );
  }
};
