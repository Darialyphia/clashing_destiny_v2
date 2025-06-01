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
import type { SpellCard } from '../../../entities/spell.entity';

export const arcaneInsight: SpellBlueprint<PreResponseTarget> = {
  id: 'arcane-insight',
  name: 'Arcane Insight',
  cardIconId: 'arcane-insight',
  description: 'Draw a card. @Level 2 bonus@: Draw another card in your Destiny zone.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.ARCANE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  subKind: SPELL_KINDS.BURST,
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 2));
  },
  async onPlay(game, card) {
    await card.player.cardManager.draw(1);
    const levelMod = card.modifiers.get(
      LevelBonusModifier
    )! as LevelBonusModifier<SpellCard>;
    if (levelMod.isActive) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
