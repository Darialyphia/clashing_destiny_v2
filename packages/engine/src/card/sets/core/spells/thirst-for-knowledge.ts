import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
import { scry } from '../../../card-actions-utils';
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
    '@Scry 1@ + @[spellpower]@. Draw a card. @[level] 4+@ draw a card in your Destiny zone.',
  collectable: true,
  unique: false,
  manaCost: 3,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
  },
  async onPlay(game, card) {
    await scry(game, card, card.player.hero.spellPower + 1);
    await card.player.cardManager.draw(1);
    if (card.modifiers.get(LevelBonusModifier)?.isActive) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
