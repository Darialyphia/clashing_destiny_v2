import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { BurnModifier } from '../../../../modifier/modifiers/burn.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleEnemyMinionTargetRules } from '../../../card-utils';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.card';

export const surgeOfWill: SpellBlueprint<MinionCard> = {
  id: 'surge-of-will',
  name: 'Surge of Will',
  cardIconId: 'spell-surge-of-will',
  description: 'Your hero has +2 Spellpower until the end of the turn.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new SimpleSpellpowerBuffModifier('surge_of_will_buff', game, card, {
        amount: 2,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
