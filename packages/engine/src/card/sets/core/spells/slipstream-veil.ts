import dedent from 'dedent';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { ElusiveModifier } from '../../../../modifier/modifiers/elusive.modiier';

export const slipstreamVeil: SpellBlueprint = {
  id: 'slipstream-veil',
  name: 'Slipstream Veil',
  cardIconId: 'spells/slipstream-veil',
  description: dedent`
  Give an ally minion @Elusive@.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  speed: CARD_SPEED.FLASH,
  spellSchool: SPELL_SCHOOLS.WATER,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  abilities: [],
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
    await target.modifiers.add(new ElusiveModifier(game, card));
  }
};
