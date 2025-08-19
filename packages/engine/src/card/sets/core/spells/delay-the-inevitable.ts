import dedent from 'dedent';
import { MainDeckCardInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';

export const delayTheInevitable: SpellBlueprint = {
  id: 'delay-the-inevitable',
  name: 'Delay the Inevitable',
  cardIconId: 'spell-delay-the-inevitable',
  description: dedent`
  Negate all damage dealt to your hero this turn. At the end of your next turn, deal the negated damage to your hero.
  
  @Trap@ : Your hero is dealt damage that would reduce their HP to 0. 
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  affinity: AFFINITIES.CHRONO,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 5));
  },
  async onPlay(game, card) {}
};
