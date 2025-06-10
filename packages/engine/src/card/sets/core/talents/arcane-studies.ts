import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { TalentBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { mage } from '../heroes/mage';

export const arcaneStudies: TalentBlueprint = {
  id: 'arcane-studies',
  name: 'Arcane Studies',
  cardIconId: 'arcane-studies',
  description: 'Your hero has +1 Spellpower.',
  affinity: AFFINITIES.ARCANE,
  collectable: true,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  destinyCost: 1,
  level: 1,
  heroId: mage.id,
  rarity: RARITIES.RARE,
  kind: CARD_KINDS.TALENT,
  setId: CARD_SETS.CORE,
  tags: [],
  async onInit() {},
  async onPlay(game, card) {
    await card.player.hero.modifiers.add(
      new SimpleSpellpowerBuffModifier('arcane-studies', game, card, { amount: 1 })
    );
  }
};
