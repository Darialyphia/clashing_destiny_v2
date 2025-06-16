import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import type { PreResponseTarget, SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';

export const thirstForKnowledge: SpellBlueprint<PreResponseTarget> = {
  id: 'thirst-for-knowledge',
  name: 'Thirst for Knowledge',
  cardIconId: 'spell-thirst-for-knowledge',
  description:
    'Draw 1 + @[spellpower]@ cards, then put all non Arcane cards in your hand into your Destiny Zone.',
  collectable: true,
  unique: false,
  manaCost: 3,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
  },
  async onPlay(game, card) {
    const amountToDraw = 1 + card.player.hero.spellPower;
    await card.player.cardManager.draw(amountToDraw);
    const nonArcaneCards = card.player.cardManager.hand.filter(
      c => c.affinity !== AFFINITIES.ARCANE
    );

    for (const card of nonArcaneCards) {
      await card.sendToDestinyZone();
    }
  }
};
